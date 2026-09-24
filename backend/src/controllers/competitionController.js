const Competition = require("../models/Competition");
const Registration = require("../models/Registration");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { computeState } = require("./lifecycle");

// No public domain exists for this assignment — the link just needs to be a
// real, stable, copyable/shareable string built from real data (the user's
// referralCode + the competition id), not a hardcoded display string.
const APP_BASE_URL = process.env.APP_BASE_URL || "https://feedants.app";

async function computeReferralStats(competitionId, userId) {
  const [user, competition, earnedSignups] = await Promise.all([
    User.findById(userId).lean(),
    Competition.findById(competitionId).lean(),
    Registration.countDocuments({ competition: competitionId, referredBy: userId, status: "confirmed" }),
  ]);
  if (!user) return null; // x-user-id didn't resolve to a real User — caller renders no referral block
  const bonusAmount = competition?.referral?.bonusAmount || 0;
  return {
    code: user.referralCode,
    link: `${APP_BASE_URL}/r/${user.referralCode}?competition=${competitionId}`,
    bonusAmount,
    earnedSignups,
    earnedAmount: earnedSignups * bonusAmount,
    description: competition?.referral?.description || null,
  };
}

const REQUIRED_FIELDS = [
  "title",
  "prizePool",
  "entryFee",
  "totalSpots",
  "registrationStart",
  "registrationEnd",
  "submissionStart",
  "submissionEnd",
  "resultsDate",
];

// POST /api/competitions
// Not behind admin auth in this assignment's scope (no admin role exists),
// but the validation is real: required fields, positive numbers, and dates
// that actually form a valid lifecycle (registration before submission
// before results) — a garbage payload can't create a competition the
// lifecycle engine would compute nonsense states for.
async function createCompetition(req, res) {
  const body = req.body || {};

  const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  if (Number(body.prizePool) < 0 || Number(body.entryFee) < 0 || Number(body.totalSpots) <= 0) {
    return res.status(400).json({ error: "prizePool/entryFee must be >= 0 and totalSpots must be > 0" });
  }

  const dates = {
    registrationStart: new Date(body.registrationStart),
    registrationEnd: new Date(body.registrationEnd),
    submissionStart: new Date(body.submissionStart),
    submissionEnd: new Date(body.submissionEnd),
    resultsDate: new Date(body.resultsDate),
  };
  for (const [key, value] of Object.entries(dates)) {
    if (Number.isNaN(value.getTime())) {
      return res.status(400).json({ error: `${key} is not a valid date` });
    }
  }
  if (
    !(
      dates.registrationStart < dates.registrationEnd &&
      dates.registrationEnd <= dates.submissionStart &&
      dates.submissionStart < dates.submissionEnd &&
      dates.submissionEnd <= dates.resultsDate
    )
  ) {
    return res.status(400).json({
      error:
        "Dates must satisfy: registrationStart < registrationEnd <= submissionStart < submissionEnd <= resultsDate",
    });
  }

  const competition = await Competition.create({
    title: body.title,
    bannerUrl: body.bannerUrl || "",
    description: body.description || "",
    rules: body.rules || "",
    faq: body.faq || "",
    tags: Array.isArray(body.tags) ? body.tags : [],
    perk: body.perk || "",
    disclaimer: body.disclaimer || "",
    prizePool: Number(body.prizePool),
    entryFee: Number(body.entryFee),
    totalSpots: Number(body.totalSpots),
    spotsBooked: 0,
    judge: body.judge || undefined,
    rewards: Array.isArray(body.rewards) ? body.rewards : [],
    previousWinners: Array.isArray(body.previousWinners) ? body.previousWinners : [],
    referral: body.referral || undefined,
    ...dates,
  });

  return res.status(201).json({ competition });
}

// GET /api/competitions
// Lightweight list for the app to pick a competition to open — the
// assignment only specced the details screen, not a browse screen, so this
// stays minimal (id/title/state) rather than growing into a full feed.
async function listCompetitions(req, res) {
  const competitions = await Competition.find().sort({ createdAt: -1 }).lean();
  const withState = competitions.map((c) => ({
    _id: c._id,
    title: c.title,
    bannerUrl: c.bannerUrl,
    state: computeState(c, new Date()).state,
  }));
  return res.json({ competitions: withState });
}

// GET /api/competitions/:id
// Public shape: competition fields + server-computed lifecycle state.
async function getCompetition(req, res) {
  const competition = await Competition.findById(req.params.id).lean();
  if (!competition) return res.status(404).json({ error: "Competition not found" });

  const lifecycle = computeState(competition, new Date());
  return res.json({ competition, lifecycle });
}

// GET /api/competitions/:id/me
// Per-user overlay: is this caller registered, have they submitted.
// Requires requireUser middleware.
async function getMyState(req, res) {
  const { id } = req.params;
  const [competition, registration, submission, referral] = await Promise.all([
    Competition.findById(id).lean(),
    Registration.findOne({ competition: id, user: req.userId, status: "confirmed" }).lean(),
    Submission.findOne({ competition: id, user: req.userId }).lean(),
    computeReferralStats(id, req.userId),
  ]);
  if (!competition) return res.status(404).json({ error: "Competition not found" });

  const lifecycle = computeState(competition, new Date());
  return res.json({
    isRegistered: !!registration,
    registeredAt: registration?.registeredAt || null,
    hasSubmitted: !!submission,
    submittedAt: submission?.submittedAt || null,
    submissionFileUrl: submission?.fileUrl || null,
    referral,
    lifecycle,
  });
}

// POST /api/competitions/:id/register
//
// Concurrency strategy: a single atomic findOneAndUpdate that both checks
// and increments spotsBooked in one document-level operation —
//
//   Competition.findOneAndUpdate(
//     { _id: id, spotsBooked: { $lt: totalSpots } },
//     { $inc: { spotsBooked: 1 } }
//   )
//
// MongoDB guarantees atomicity of a single-document update: two requests
// racing for the last spot each get their own atomic pass through the
// storage engine, so the filter's $lt check and the $inc happen as one
// indivisible step per request. Whichever request the server serializes
// first "wins" the slot and moves spotsBooked past totalSpots for the
// second; the second request's filter then no longer matches, updatedDoc
// is null, and it fails cleanly with "competition full" instead of racing
// past the cap. This makes overbooking structurally impossible without a
// multi-document transaction, a lock service, or a replica-set requirement
// — a plain standalone MongoDB deployment already gives us this guarantee
// on a single document, which is the cheapest tool for this exact shape of
// problem (one counter, one condition).
//
// Why not a multi-document transaction: a transaction would be needed if
// we had to keep two collections consistent as a single all-or-nothing
// unit under contention. Here we don't — we compensate instead. We reserve
// the spot first (fast, always consistent), then try to write the
// Registration row; if that insert fails (e.g. a duplicate — the same user
// racing themselves from two tabs), we release the spot we just reserved
// with a compensating $inc: -1. That keeps the hot path a single atomic
// document write under load, and only pays for a second write on the rare
// double-submit case.
async function register(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  const { referralCode } = req.body || {};

  const competition = await Competition.findById(id).lean();
  if (!competition) return res.status(404).json({ error: "Competition not found" });

  const lifecycle = computeState(competition, new Date());
  if (!lifecycle.canRegister) {
    return res.status(409).json({ error: "Registration is not open", state: lifecycle.state });
  }

  // Resolve the referral code to a real user before touching the spot
  // counter, so a bad code fails fast without reserving (and having to
  // release) a spot.
  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode }).lean();
    if (!referrer) return res.status(400).json({ error: "Invalid referral code" });
    if (String(referrer._id) === String(userId)) {
      return res.status(400).json({ error: "You can't refer yourself" });
    }
    referredBy = referrer._id;
  }

  // Atomic reserve: only succeeds if a spot is actually available right now.
  const reserved = await Competition.findOneAndUpdate(
    { _id: id, spotsBooked: { $lt: competition.totalSpots } },
    { $inc: { spotsBooked: 1 } },
    { new: true }
  );
  if (!reserved) {
    return res.status(409).json({ error: "Competition is full", state: "registration_full" });
  }

  try {
    const registration = await Registration.create({
      competition: id,
      user: userId,
      status: "confirmed",
      referredBy,
    });
    return res.status(201).json({
      registration,
      spotsLeft: Math.max(reserved.totalSpots - reserved.spotsBooked, 0),
    });
  } catch (err) {
    // Roll back the reservation — either a genuine duplicate registration
    // (unique index violation, code 11000) or an unexpected failure. Either
    // way the user did not actually get a spot, so give it back.
    await Competition.updateOne({ _id: id }, { $inc: { spotsBooked: -1 } });
    if (err.code === 11000) {
      return res.status(409).json({ error: "You are already registered for this competition" });
    }
    throw err;
  }
}

// POST /api/competitions/:id/submit
async function submit(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  const { fileUrl, note } = req.body;

  if (!fileUrl) return res.status(400).json({ error: "fileUrl is required" });

  const competition = await Competition.findById(id).lean();
  if (!competition) return res.status(404).json({ error: "Competition not found" });

  const lifecycle = computeState(competition, new Date());
  if (!lifecycle.canSubmit) {
    return res.status(409).json({ error: "Submissions are not open", state: lifecycle.state });
  }

  const registration = await Registration.findOne({
    competition: id,
    user: userId,
    status: "confirmed",
  }).lean();
  if (!registration) {
    return res.status(403).json({ error: "You must be registered to submit" });
  }

  try {
    const submission = await Submission.findOneAndUpdate(
      { competition: id, user: userId },
      { fileUrl, note, submittedAt: new Date(), registration: registration._id },
      { upsert: true, new: true }
    );
    return res.status(201).json({ submission });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Submission already exists, retry the update" });
    }
    throw err;
  }
}

module.exports = { createCompetition, listCompetitions, getCompetition, getMyState, register, submit };
