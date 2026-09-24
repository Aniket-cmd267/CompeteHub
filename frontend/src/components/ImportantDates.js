import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, cardShadow } from "../theme";

function formatDate(d) {
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// All dates come from lifecycle.deadlines, which the server computed —
// this component never guesses at dates itself.
export default function ImportantDates({ deadlines }) {
  if (!deadlines) return null;
  const items = [
    ["calendar-outline", "Register Before", deadlines.registrationEnd],
    ["paper-plane-outline", "Submission Starts", deadlines.submissionStart],
    ["cloud-upload-outline", "Submission Ends", deadlines.submissionEnd],
    ["trophy-outline", "Result Date", deadlines.resultsDate],
  ];
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Important Dates</Text>
      <View style={styles.grid}>
        {items.map(([icon, label, date], i) => (
          <View key={label} style={[styles.cell, i % 2 === 0 && styles.cellRightBorder, i < 2 && styles.cellBottomBorder]}>
            <Ionicons name={icon} size={15} color={colors.primary} style={styles.icon} />
            <View>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.date}>{formatDate(date)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 12 },
  heading: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    ...cardShadow,
  },
  cell: { width: "50%", flexDirection: "row", padding: 12, alignItems: "flex-start" },
  cellRightBorder: { borderRightWidth: 1, borderRightColor: colors.border },
  cellBottomBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { marginRight: 8, marginTop: 1 },
  label: { fontSize: 11, color: colors.textMuted },
  date: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 2 },
});
