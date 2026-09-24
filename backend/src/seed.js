require("dotenv").config();
const connectDB = require("./db");
const Competition = require("./models/Competition");
const User = require("./models/User");
const Registration = require("./models/Registration");
const Submission = require("./models/Submission");

async function seed() {
  await connectDB();
  await Promise.all([
    Competition.deleteMany({}),
    User.deleteMany({}),
    Registration.deleteMany({}),
    Submission.deleteMany({}),
  ]);

  const now = Date.now();
  const competition = await Competition.create({
    title: "Feedants Classical Dance",
    bannerUrl: "",
    tags: ["Dance", "Multi-Win"],
    perk: "Winners get certificate",
    disclaimer: "Only contributions from paid participants will be considered for judging.",
    description:
      "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.",
    rules: "One entry per participant. Original performance only. Video must be under 5 minutes.",
    faq: "Q: Can I re-upload my submission? A: Yes, until submissions close.",
    prizePool: 1500,
    entryFee: 99,
    totalSpots: 20,
    spotsBooked: 0,
    judge: {
      name: "Manju Dubey",
      title: "Professional Kathak Dancer",
      photoUrl: "",
      bio: "12+ Years of Experience",
    },
    rewards: [
      { rank: "1st Winner", amount: 550 },
      { rank: "2nd Winner", amount: 300 },
      { rank: "3rd Winner", amount: 240 },
      { rank: "4th Winner", amount: 200 },
      { rank: "5th Winner", amount: 130 },
      { rank: "6th Winner", amount: 80 },
    ],
    previousWinners: [
      { year: 2025, name: "Riya Shah", photoUrl: "", prizeWon: 550 },
      { year: 2025, name: "Aarav Mehta", photoUrl: "", prizeWon: 550 },
      { year: 2025, name: "Neha Verma", photoUrl: "", prizeWon: 300 },
      { year: 2025, name: "Ishita Chopra", photoUrl: "", prizeWon: 240 },
    ],
    referral: { bonusAmount: 10, description: "You earn ₹10 for every signup." },
    registrationStart: new Date(now - 60 * 60 * 1000),
    registrationEnd: new Date(now + 60 * 60 * 1000),
    submissionStart: new Date(now + 61 * 60 * 1000),
    submissionEnd: new Date(now + 2 * 60 * 60 * 1000),
    resultsDate: new Date(now + 3 * 60 * 60 * 1000),
  });

  console.log("Seeded competition:", competition._id.toString());
  console.log("Create users manually via:  node src/createUser.js \"Name\" email@example.com");
  console.log("Or via HTTP:  POST /api/users  with  { \"name\": \"...\", \"email\": \"...\" }");

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
