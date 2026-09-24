const Competition = require("../models/Competition");

// Dev-only test helper: rewrites a competition's date fields so it lands in
// a specific lifecycle stage RIGHT NOW, without waiting real time or
// hand-editing MongoDB. This is the only place the server ever writes dates
// based on a client's say-so — every other route still computes state from
// real server time (see lifecycle.js). Never expose this in production; it
// exists purely to make the checklist in the assignment's QA pass
// (stepping through every stage, testing deadline edges) practical to run
// locally instead of requiring real waits between each date.
//
// POST /api/dev/competitions/:id/simulate-stage
// body: { stage: "upcoming" | "registration_open" | "registration_full" |
//                 "registration_closed" | "submission_open" |
//                 "submission_closed" | "results_declared" }
async function simulateStage(req, res) {
  const { id } = req.params;
  const { stage } = req.body || {};

  const competition = await Competition.findById(id);
  if (!competition) return res.status(404).json({ error: "Competition not found" });

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const updates = {};

  switch (stage) {
    case "upcoming":
      updates.registrationStart = new Date(now + HOUR);
      updates.registrationEnd = new Date(now + 2 * HOUR);
      updates.submissionStart = new Date(now + 3 * HOUR);
      updates.submissionEnd = new Date(now + 4 * HOUR);
      updates.resultsDate = new Date(now + 5 * HOUR);
      updates.spotsBooked = 0;
      break;
    case "registration_open":
      updates.registrationStart = new Date(now - HOUR);
      updates.registrationEnd = new Date(now + HOUR);
      updates.submissionStart = new Date(now + 2 * HOUR);
      updates.submissionEnd = new Date(now + 3 * HOUR);
      updates.resultsDate = new Date(now + 4 * HOUR);
      updates.spotsBooked = 0;
      break;
    case "registration_full":
      updates.registrationStart = new Date(now - HOUR);
      updates.registrationEnd = new Date(now + HOUR);
      updates.submissionStart = new Date(now + 2 * HOUR);
      updates.submissionEnd = new Date(now + 3 * HOUR);
      updates.resultsDate = new Date(now + 4 * HOUR);
      updates.spotsBooked = competition.totalSpots; // force full without 20 real registrations
      break;
    case "registration_closed":
      updates.registrationStart = new Date(now - 2 * HOUR);
      updates.registrationEnd = new Date(now - HOUR);
      updates.submissionStart = new Date(now + HOUR);
      updates.submissionEnd = new Date(now + 2 * HOUR);
      updates.resultsDate = new Date(now + 3 * HOUR);
      break;
    case "submission_open":
      updates.registrationStart = new Date(now - 3 * HOUR);
      updates.registrationEnd = new Date(now - 2 * HOUR);
      updates.submissionStart = new Date(now - HOUR);
      updates.submissionEnd = new Date(now + HOUR);
      updates.resultsDate = new Date(now + 2 * HOUR);
      break;
    case "submission_closed":
      updates.registrationStart = new Date(now - 4 * HOUR);
      updates.registrationEnd = new Date(now - 3 * HOUR);
      updates.submissionStart = new Date(now - 2 * HOUR);
      updates.submissionEnd = new Date(now - HOUR);
      updates.resultsDate = new Date(now + HOUR);
      break;
    case "results_declared":
      updates.registrationStart = new Date(now - 5 * HOUR);
      updates.registrationEnd = new Date(now - 4 * HOUR);
      updates.submissionStart = new Date(now - 3 * HOUR);
      updates.submissionEnd = new Date(now - 2 * HOUR);
      updates.resultsDate = new Date(now - HOUR);
      break;
    default:
      return res.status(400).json({
        error:
          "stage must be one of: upcoming, registration_open, registration_full, registration_closed, submission_open, submission_closed, results_declared",
      });
  }

  Object.assign(competition, updates);
  await competition.save();

  return res.json({ competition, appliedStage: stage });
}

module.exports = { simulateStage };
