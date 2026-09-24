import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, cardShadow } from "../theme";

// Static trust/payment row — mirrors the mockup's "how prize money is paid"
// + payment-security badge. Not backed by real payout/video data, so it's
// deliberately kept decorative rather than wired to fake endpoints.
export default function TrustRow() {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.videoRow}>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={14} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.videoTitle}>How will you receive prize money?</Text>
          <Text style={styles.videoSubtitle}>Watch video to know more</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.badgeCol}>
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.textMuted} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>Refund policy</Text>
        </View>
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.textMuted} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>Secure payments powered by Razorpay</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12, ...cardShadow },
  videoRow: { flexDirection: "row", alignItems: "center" },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playIcon: { color: colors.primary, fontSize: 13 },
  videoTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
  videoSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  badgeCol: {},
  badgeRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  badgeIcon: { marginRight: 8 },
  badgeText: { fontSize: 11, color: colors.textMuted },
});
