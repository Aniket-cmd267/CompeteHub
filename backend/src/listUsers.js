// CLI helper: print every User in the DB (id, name, email, referralCode).
// Usage: node src/listUsers.js
require("dotenv").config();
const connectDB = require("./db");
const User = require("./models/User");

async function main() {
  await connectDB();
  const users = await User.find().sort({ createdAt: 1 }).lean();
  if (users.length === 0) {
    console.log("No users yet — create one with: node src/createUser.js \"Name\" email@example.com");
  } else {
    console.table(
      users.map((u) => ({
        userId: u._id.toString(),
        name: u.name,
        email: u.email,
        referralCode: u.referralCode,
      }))
    );
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
