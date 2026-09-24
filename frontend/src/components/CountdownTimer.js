import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Purely presentational — ticks locally between polls, but the deadline it
// counts down to always comes from the server (see CompetitionDetailsScreen).
// It never decides state on its own, only renders the time remaining.
export default function CountdownTimer({ label, targetDate }) {
  const [remaining, setRemaining] = useState(() => targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(targetDate - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (remaining <= 0) {
    return (
      <View style={styles.container}>
        <Ionicons name="hourglass-outline" size={16} color={colors.primaryDark} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.expired}>Ended</Text>
      </View>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <View style={styles.container}>
      <Ionicons name="hourglass-outline" size={16} color={colors.primaryDark} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.timer}>
        {days > 0 ? `${days}d : ` : ""}
        {String(hours).padStart(2, "0")}h : {String(minutes).padStart(2, "0")}m : {String(seconds).padStart(2, "0")}s
      </Text>
      <Ionicons name="alarm-outline" size={13} color={colors.primaryDark} />
      <Text style={styles.hurry}> Hurry up!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  icon: { marginRight: 6 },
  label: { fontSize: 12, color: colors.primaryDark, flexShrink: 0, marginRight: 8 },
  timer: { fontSize: 15, fontWeight: "700", color: colors.primaryDark, flex: 1 },
  hurry: { fontSize: 11, color: colors.primaryDark },
  expired: { fontSize: 13, fontWeight: "700", color: colors.danger, flex: 1 },
});
