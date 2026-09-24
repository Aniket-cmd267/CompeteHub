import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Static app-chrome nav bar from the mockup. This screen has no router/tab
// navigator wired up in this assignment's scope, so all items are visual
// only — "Competitions" is shown active since that's conceptually where
// this screen lives.
const ITEMS = [
  { key: "home", icon: "home-outline", label: "Home" },
  { key: "explore", icon: "search-outline", label: "Explore" },
  { key: "create", icon: "add", isCenter: true },
  { key: "competitions", icon: "trophy-outline", label: "Competitions", active: true },
  { key: "profile", icon: "person-outline", label: "Profile" },
];

export default function BottomNavBar({ onCreate }) {
  return (
    <View style={styles.bar}>
      {ITEMS.map((item) =>
        item.isCenter ? (
          <TouchableOpacity key={item.key} style={styles.centerButton} onPress={onCreate}>
            <Ionicons name={item.icon} size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity key={item.key} style={styles.item}>
            <Ionicons name={item.icon} size={18} color={item.active ? colors.primary : colors.textMuted} />
            <Text style={[styles.label, item.active && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 4,
  },
  item: { alignItems: "center", flex: 1 },
  label: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: "700" },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -18,
  },
});
