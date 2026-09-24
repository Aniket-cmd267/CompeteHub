require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const competitionRoutes = require("./routes/competitionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/competitions", competitionRoutes);
app.use("/api/users", userRoutes);

// Test-only lifecycle override — never mounted when NODE_ENV=production, so
// this can't ship live even if left in by accident.
if (process.env.NODE_ENV !== "production") {
  const devRoutes = require("./routes/devRoutes");
  app.use("/api/dev", devRoutes);
}

app.get("/health", (req, res) => res.json({ ok: true }));

// Centralized error handler — anything thrown/rejected in a route lands here
// instead of leaking a stack trace to the client.
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ error: `Invalid id: ${err.value}` });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API listening on :${PORT}`)))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
