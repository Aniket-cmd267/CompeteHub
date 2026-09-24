import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, cardShadow } from "../theme";

// The intro-video play button is decorative — no video field/playback is
// part of this assignment's data model, so it's a static icon matching the
// mockup rather than a wired-up player.
export default function JudgeCard({ judge }) {
  if (!judge) return null;
  return (
    <View style={styles.card}>
      {judge.photoUrl ? (
        <Image source={{ uri: judge.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoFallback]}>
          <Text style={styles.photoInitial}>{judge.name?.[0] ?? "?"}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.label}>Judge</Text>
        <Text style={styles.name}>{judge.name}</Text>
        <Text style={styles.title}>{judge.title}</Text>
        {judge.bio ? <Text style={styles.bio}>{judge.bio}</Text> : null}
      </View>
      <TouchableOpacity style={styles.videoButton}>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={13} color={colors.primary} />
        </View>
        <Text style={styles.videoLabel}>Intro Video</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  photo: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  photoFallback: { backgroundColor: colors.primaryLight, justifyContent: "center", alignItems: "center" },
  photoInitial: { fontSize: 20, fontWeight: "700", color: colors.primary },
  info: { flex: 1 },
  label: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  title: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  bio: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  videoButton: { alignItems: "center" },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: { color: colors.primary, fontSize: 12 },
  videoLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
});
