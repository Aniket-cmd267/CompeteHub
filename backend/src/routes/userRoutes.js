const express = require("express");
const { requireUser } = require("../middleware/auth");
const { createUser, getUser } = require("../controllers/userController");

const router = express.Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/", wrap(createUser));
router.get("/:id", requireUser, wrap(getUser));

module.exports = router;
