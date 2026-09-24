const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  { rank: String, amount: Number, description: String },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    year: Number,
    name: String,
    photoUrl: String,
    prizeWon: Number,
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    bannerUrl: String,
    description: String,
    rules: String,
    faq: String,

    // Small chips shown on the header card (e.g. "Dance", "Multi-Win") and a
    // short perk line (e.g. "Winners get certificate") — real fields so the
    // header card has no hardcoded label baked into the UI.
    tags: [String],
    perk: String,
    disclaimer: String,

    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true, default: 0 },

    totalSpots: { type: Number, required: true },
    // spotsBooked is the atomic counter guarded on every registration write.
    spotsBooked: { type: Number, required: true, default: 0 },

    judge: {
      name: String,
      title: String,
      photoUrl: String,
      bio: String,
    },

    rewards: [rewardSchema],
    previousWinners: [winnerSchema],

    referral: {
      bonusAmount: Number,
      description: String,
    },

    // Lifecycle boundaries — server is the only source of truth for "now".
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultsDate: { type: Date, required: true },
  },
  { timestamps: true }
);

competitionSchema.index({ registrationEnd: 1 });
competitionSchema.index({ submissionEnd: 1 });

module.exports = mongoose.model("Competition", competitionSchema);
