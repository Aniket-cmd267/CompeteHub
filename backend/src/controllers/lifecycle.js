// Pure function: given a competition doc and "now", derive the single
// server-authoritative state. Never trust a client-sent timestamp here.
function computeState(competition, now = new Date()) {
  const {
    registrationStart,
    registrationEnd,
    submissionStart,
    submissionEnd,
    resultsDate,
    spotsBooked,
    totalSpots,
  } = competition;

  let state;
  if (now < registrationStart) {
    state = "upcoming";
  } else if (now >= registrationStart && now < registrationEnd) {
    state = spotsBooked >= totalSpots ? "registration_full" : "registration_open";
  } else if (now >= registrationEnd && now < submissionStart) {
    state = "registration_closed";
  } else if (now >= submissionStart && now < submissionEnd) {
    state = "submission_open";
  } else if (now >= submissionEnd && now < resultsDate) {
    state = "submission_closed";
  } else {
    state = "results_declared";
  }

  return {
    state,
    canRegister: state === "registration_open",
    canSubmit: state === "submission_open",
    spotsLeft: Math.max(totalSpots - spotsBooked, 0),
    serverTime: now.toISOString(),
    deadlines: {
      registrationStart,
      registrationEnd,
      submissionStart,
      submissionEnd,
      resultsDate,
    },
  };
}

module.exports = { computeState };
