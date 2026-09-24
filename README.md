# CompeteHub

Full-stack Competition Details screen: React Native (Expo) + Node/Express + MongoDB.

## Run

**Backend**
```bash
cd backend
cp .env.example .env   # set MONGO_URI to your MongoDB
npm install
node src/seed.js       # creates one competition, prints its id
npm run dev
```

**Create a test user** (needed for registering/submitting from the app):
```bash
node src/createUser.js "Your Name" you@example.com
```

**Frontend**
```bash
cd frontend
npm install
npx expo start
```
Scan the QR code with Expo Go, or press `w` for a web preview.

If testing on a physical phone, set `BASE_URL` in `frontend/src/api/client.js` to your PC's LAN IP (`ipconfig`), not `localhost`.

## Testing

**Manual, from the UI:**
- Open the app, sign in with a name/email (creates a real user) — use a different email to switch accounts.
- Register, then try registering again → should be blocked.
- Use one user's referral link/code when a second user registers → first user's earnings should update.
- Tap the `+` in the bottom nav to create a new competition end-to-end.

**Concurrency (spots can't overbook):**
```bash
cd backend
node src/createTestUsers.js 25
node src/loadtest.js <competitionId> <userId1> <userId2> ... <userId25>
```
With `totalSpots: 20`, expect exactly 20 succeeded and 5 rejected as `registration_full`.

**Jump lifecycle stages instantly** (instead of waiting real time):
```bash
curl -X POST http://localhost:4000/api/dev/competitions/<id>/simulate-stage \
  -H "content-type: application/json" \
  -d "{\"stage\":\"submission_open\"}"
```
Valid stages: `upcoming`, `registration_open`, `registration_full`, `registration_closed`, `submission_open`, `submission_closed`, `results_declared`.
