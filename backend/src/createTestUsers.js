// CLI helper: create N test users in one go (for manual multi-user testing,
// e.g. referral flow or the register endpoint from two different accounts).
// Usage: node src/createTestUsers.js 5
require("dotenv").config();
const connectDB = require("./db");
const User = require("./models/User");

async function main() {
  const count = Number(process.argv[2]) || 5;
  await connectDB();

  const created = [];
  for (let i = 1; i <= count; i++) {
    const email = `testuser${Date.now()}_${i}@example.com`;
    const user = await User.create({ name: `Test User ${i}`, email });
    created.push({ userId: user._id.toString(), name: user.name, email: user.email, referralCode: user.referralCode });
  }

  console.table(created);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
