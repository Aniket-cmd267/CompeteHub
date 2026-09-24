import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, cardShadow } from "../theme";

// tabs: [{ key, label, content }] — content is real text from the
// competition doc (description/rules/faq), not placeholder copy.
export default function TabsView({ tabs }) {
  const [active, setActive] = useState(tabs?.[0]?.key);
  if (!tabs || tabs.length === 0) return null;
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <View style={styles.card}>
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setActive(t.key)} style={styles.tabButton}>
            <Text style={[styles.tabLabel, active === t.key && styles.tabLabelActive]}>{t.label}</Text>
            {active === t.key ? <View style={styles.underline} /> : null}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.content}>{activeTab?.content || "No content yet."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12, ...cardShadow },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 10 },
  tabButton: { marginRight: 24, paddingBottom: 8 },
  tabLabel: { fontSize: 13, color: colors.textMuted },
  tabLabelActive: { color: colors.primary, fontWeight: "700" },
  underline: { height: 2, backgroundColor: colors.primary, marginTop: 4, borderRadius: 1 },
  content: { fontSize: 13, color: colors.text, lineHeight: 20 },
});
