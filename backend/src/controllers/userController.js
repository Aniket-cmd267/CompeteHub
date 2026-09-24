const User = require("../models/User");

async function createUser(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  try {
    const user = await User.create({ name, email });
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    throw err;
  }
}

async function getUser(req, res) {
  const user = await User.findById(req.params.id).lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
}

module.exports = { createUser, getUser };
