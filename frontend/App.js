import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { listCompetitions } from "./src/api/client";
import { getSession, clearSession } from "./src/api/session";
import CompetitionDetailsScreen from "./src/screens/CompetitionDetailsScreen";
import SignInScreen from "./src/screens/SignInScreen";
import CreateCompetitionScreen from "./src/screens/CreateCompetitionScreen";

// No hardcoded competition id: the app asks the backend which competition
// to show (the most recently created one) instead of a value pasted into
// source. There's no real router here — "screen" is a plain enum switch,
// which is enough for this assignment's two extra screens (sign-in, create)
// without pulling in a navigation library.
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking storage
  const [competitionId, setCompetitionId] = useState(null);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState("details"); // "details" | "create"

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  useEffect(() => {
    if (!session) return;
    listCompetitions()
      .then(({ competitions }) => {
        if (competitions.length === 0) {
          setError("No competitions found — run `node src/seed.js` in the backend first.");
          return;
        }
        setCompetitionId(competitions[0]._id);
      })
      .catch((e) => setError(e.message));
  }, [session]);

  const handleSwitchUser = async () => {
    await clearSession();
    setCompetitionId(null);
    setError(null);
    setSession(null);
  };

  const handleCreated = (newCompetitionId) => {
    setCompetitionId(newCompetitionId);
    setError(null);
    setScreen("details");
  };

  if (session === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <SignInScreen onSignedIn={setSession} />;
  }

  if (screen === "create") {
    return <CreateCompetitionScreen onCreated={handleCreated} onCancel={() => setScreen("details")} />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!competitionId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <CompetitionDetailsScreen
      route={{ params: { competitionId } }}
      session={session}
      onSwitchUser={handleSwitchUser}
      onCreateCompetition={() => setScreen("create")}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: "#c0392b", textAlign: "center" },
});
