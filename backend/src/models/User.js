const mongoose = require("mongoose");
const crypto = require("crypto");

function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex"); // e.g. "a1b2c3d4"
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Auto-generated once per user, reused across every competition's
    // referral link — a real identifier, not a display placeholder.
    referralCode: { type: String, required: true, unique: true, default: generateReferralCode },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
