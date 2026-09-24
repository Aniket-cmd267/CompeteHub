import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Share, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { colors, cardShadow } from "../theme";

// `referral` is the server-computed block from GET /api/competitions/:id/me
// ({ link, code, bonusAmount, earnedSignups, earnedAmount, description }) —
// the link is a real per-user code, and earnedSignups/earnedAmount are a
// real count of Registration rows with referredBy === this user, not a
// static "you earn ₹X" line.
export default function ReferralCard({ referral }) {
  const [copied, setCopied] = useState(false);
  if (!referral) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referral.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Join this competition on Feedants! ${referral.link}` });
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="megaphone-outline" size={16} color={colors.text} style={styles.icon} />
        <Text style={styles.heading}>Refer & Earn more discount</Text>
      </View>

      <View style={styles.linkRow}>
        <TextInput
          style={styles.linkInput}
          value={referral.link}
          editable={false}
          numberOfLines={1}
        />
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Text style={styles.copyButtonText}>{copied ? "Copied!" : "Copy Link"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.referButton} onPress={handleShare}>
          <Text style={styles.referButtonText}>Refer Now</Text>
        </TouchableOpacity>
        <Text style={styles.earnText}>
          You earn ₹{referral.bonusAmount} for every signup
          {referral.earnedSignups > 0
            ? ` — earned ₹${referral.earnedAmount} from ${referral.earnedSignups} so far`
            : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryLight, borderRadius: 16, padding: 14, marginBottom: 12, ...cardShadow },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  icon: { marginRight: 8 },
  heading: { fontSize: 14, fontWeight: "700", color: colors.text },
  linkRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  linkInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 8,
  },
  copyButton: { backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  copyButtonText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  footerRow: {},
  referButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: "center", marginBottom: 6 },
  referButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  earnText: { fontSize: 11, color: colors.primaryDark, textAlign: "center" },
});
