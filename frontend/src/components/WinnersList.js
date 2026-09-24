import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function WinnersList({ winners }) {
  if (!winners || winners.length === 0) {
    return <Text style={styles.empty}>No previous winners yet.</Text>;
  }
  return (
    <FlatList
      data={winners}
      keyExtractor={(w, i) => `${w.year}-${w.name}-${i}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          <View style={styles.photoWrap}>
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoFallback]}>
                <Text style={styles.photoInitial}>{item.name?.[0] ?? "?"}</Text>
              </View>
            )}
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{index + 1}</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.prize}>₹{item.prizeWon?.toLocaleString?.() ?? item.prizeWon}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { width: 92, marginRight: 12, alignItems: "center" },
  photoWrap: { position: "relative" },
  photo: { width: 72, height: 72, borderRadius: 12 },
  photoFallback: { backgroundColor: colors.primaryLight, justifyContent: "center", alignItems: "center" },
  photoInitial: { fontSize: 22, fontWeight: "700", color: colors.primary },
  rankBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  rankBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  name: { fontSize: 12, fontWeight: "600", textAlign: "center", marginTop: 8, color: colors.text },
  prize: { fontSize: 11, color: colors.primary, fontWeight: "700", marginTop: 2 },
  empty: { color: colors.textMuted, fontStyle: "italic" },
});
