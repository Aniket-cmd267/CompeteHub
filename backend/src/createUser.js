// CLI helper: create a single user without starting the server.
// Usage: node src/createUser.js "Alice" alice@example.com
require("dotenv").config();
const connectDB = require("./db");
const User = require("./models/User");

const [, , name, email] = process.argv;

if (!name || !email) {
  console.error('Usage: node src/createUser.js "Full Name" email@example.com');
  process.exit(1);
}

async function main() {
  await connectDB();
  try {
    const user = await User.create({ name, email });
    console.log(JSON.stringify({ userId: user._id.toString(), name: user.name, email: user.email }));
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.error("Error: email already exists");
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
