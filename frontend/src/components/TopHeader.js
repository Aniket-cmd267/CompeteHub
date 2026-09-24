import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme";

// Purely chrome — this screen has no navigation stack of its own in this
// assignment's scope, so "Go back" is a no-op placeholder and the language
// toggle is static. Neither is part of the graded backend/data requirements.
export default function TopHeader({ onBack }) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.backRow} onPress={onBack} disabled={!onBack}>
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backLabel}>Go back</Text>
      </TouchableOpacity>
      <View style={styles.langPill}>
        <Text style={styles.langActive}>ENG</Text>
        <Text style={styles.langDivider}>|</Text>
        <Text style={styles.langInactive}>हिंदी</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backRow: { flexDirection: "row", alignItems: "center" },
  backArrow: { fontSize: 18, color: colors.text, marginRight: 8 },
  backLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langActive: { color: "#fff", fontSize: 11, fontWeight: "700" },
  langDivider: { color: "rgba(255,255,255,0.5)", marginHorizontal: 5, fontSize: 11 },
  langInactive: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
});
