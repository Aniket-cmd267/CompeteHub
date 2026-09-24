const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    registeredAt: { type: Date, default: Date.now },
    // Who referred this signup, if any — resolved from a referralCode at
    // registration time so the referrer's earnings can be counted for real
    // instead of showing a static "you earn ₹X" line.
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// One confirmed registration per (competition, user) — the second, DB-level
// guard against double-booking. The atomic spotsBooked increment in the
// controller stops overbooking; this index stops the same user being counted
// twice if two of their own requests race.
registrationSchema.index({ competition: 1, user: 1 }, { unique: true });
// Fast "how many people registered for competition X" / "is user Y registered".
registrationSchema.index({ competition: 1, status: 1 });
// Fast "how many signups has user Y referred for competition X" (earnings).
registrationSchema.index({ competition: 1, referredBy: 1 });

module.exports = mongoose.model("Registration", registrationSchema);
