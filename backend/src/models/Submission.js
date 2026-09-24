const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
    fileUrl: { type: String, required: true },
    note: String,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One submission per (competition, user) — resubmission is a PUT/replace,
// not a new document.
submissionSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
