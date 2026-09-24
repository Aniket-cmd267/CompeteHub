import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, cardShadow } from "../theme";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RewardsTable({ rewards }) {
  if (!rewards || rewards.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Rewards</Text>
      <View style={styles.card}>
        {rewards.map((r, i) => (
          <View key={r.rank} style={[styles.row, i < rewards.length - 1 && styles.rowBorder]}>
            <View style={styles.rankCell}>
              <Text style={styles.medal}>{MEDALS[i] || "⭐"}</Text>
              <Text style={styles.rank}>{r.rank}{r.description ? ` — ${r.description}` : ""}</Text>
            </View>
            <Text style={styles.amount}>₹{r.amount?.toLocaleString?.() ?? r.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 12 },
  heading: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 8 },
  card: { backgroundColor: colors.card, borderRadius: 16, overflow: "hidden", ...cardShadow },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rankCell: { flexDirection: "row", alignItems: "center" },
  medal: { fontSize: 16, marginRight: 8 },
  rank: { fontSize: 13, fontWeight: "600", color: colors.text },
  amount: { fontSize: 14, fontWeight: "700", color: colors.primary },
});
