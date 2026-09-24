const express = require("express");
const { requireUser } = require("../middleware/auth");
const {
  createCompetition,
  listCompetitions,
  getCompetition,
  getMyState,
  register,
  submit,
} = require("../controllers/competitionController");

const router = express.Router();

// Wrap async handlers so a thrown error reaches Express's error middleware
// instead of crashing the process.
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/", wrap(createCompetition));
router.get("/", wrap(listCompetitions));
router.get("/:id", wrap(getCompetition));
router.get("/:id/me", requireUser, wrap(getMyState));
router.post("/:id/register", requireUser, wrap(register));
router.post("/:id/submit", requireUser, wrap(submit));

module.exports = router;
