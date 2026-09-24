import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export default function DisclaimerBanner({ text }) {
  if (!text) return null;
  return (
    <View style={styles.banner}>
      <Ionicons name="information-circle-outline" size={15} color={colors.primaryDark} style={styles.icon} />
      <Text style={styles.text}>
        <Text style={styles.bold}>Disclaimer: </Text>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  icon: { marginRight: 8, marginTop: 1 },
  text: { flex: 1, fontSize: 12, color: colors.primaryDark, lineHeight: 17 },
  bold: { fontWeight: "700" },
});
