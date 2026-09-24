const express = require("express");
const { simulateStage } = require("../controllers/devController");

const router = express.Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/competitions/:id/simulate-stage", wrap(simulateStage));

module.exports = router;
