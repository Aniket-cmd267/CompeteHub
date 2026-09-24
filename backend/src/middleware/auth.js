const mongoose = require("mongoose");

// Stand-in for real auth (JWT/session), which is out of scope for this
// assignment. A real deployment swaps this for verified-token middleware;
// everything downstream only depends on req.userId being trustworthy.
function requireUser(req, res, next) {
  const userId = req.header("x-user-id");
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ error: "Missing or invalid x-user-id header" });
  }
  req.userId = userId;
  next();
}

module.exports = { requireUser };
