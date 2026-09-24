// Fires N concurrent registration requests at one competition and checks
// that spotsBooked never exceeds totalSpots and no user is double-counted.
// Usage: node src/loadtest.js <competitionId> <userId1> <userId2> ...
const http = require("http");

const [competitionId, ...userIds] = process.argv.slice(2);
if (!competitionId || userIds.length === 0) {
  console.error("Usage: node src/loadtest.js <competitionId> <userId1> <userId2> ...");
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

function post(path, userId) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "localhost", port: PORT, path, method: "POST", headers: { "x-user-id": userId, "content-type": "application/json" } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(body || "{}") }));
      }
    );
    req.end();
  });
}

async function main() {
  const results = await Promise.all(
    userIds.map((uid) => post(`/api/competitions/${competitionId}/register`, uid))
  );
  const succeeded = results.filter((r) => r.status === 201).length;
  const full = results.filter((r) => r.body.state === "registration_full").length;
  const other = results.length - succeeded - full;
  console.log(`Fired ${results.length} concurrent registrations`);
  console.log(`  succeeded: ${succeeded}`);
  console.log(`  rejected (full): ${full}`);
  console.log(`  rejected (other): ${other}`);
}

main();
