import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createCompetition } from "../api/client";
import { colors, cardShadow, maxContentWidth } from "../theme";

// Dates are entered as "minutes from now" rather than raw timestamps —
// far easier to type on a phone than an ISO string, and it makes it
// impossible to submit a chronologically invalid lifecycle (each boundary
// is derived from the one before it), which the backend also re-validates
// independently.
function parseRewards(csv) {
  if (!csv.trim()) return [];
  return csv
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [rank, amount] = pair.split(":").map((s) => s.trim());
      return { rank, amount: Number(amount) || 0 };
    });
}

function parseTags(csv) {
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function CreateCompetitionScreen({ onCreated, onCancel }) {
  const [title, setTitle] = useState("");
  const [prizePool, setPrizePool] = useState("1000");
  const [entryFee, setEntryFee] = useState("0");
  const [totalSpots, setTotalSpots] = useState("20");
  const [registrationOpensIn, setRegistrationOpensIn] = useState("0");
  const [registrationDuration, setRegistrationDuration] = useState("60");
  const [submissionDuration, setSubmissionDuration] = useState("60");
  const [resultsDelay, setResultsDelay] = useState("60");
  const [judgeName, setJudgeName] = useState("");
  const [judgeTitle, setJudgeTitle] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [perk, setPerk] = useState("");
  const [rewardsCsv, setRewardsCsv] = useState("1st Winner:500, 2nd Winner:300");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Give the competition a name.");
      return;
    }
    setLoading(true);
    try {
      const now = Date.now();
      const MIN = 60 * 1000;
      const registrationStart = new Date(now + Number(registrationOpensIn) * MIN);
      const registrationEnd = new Date(registrationStart.getTime() + Number(registrationDuration) * MIN);
      const submissionStart = registrationEnd;
      const submissionEnd = new Date(submissionStart.getTime() + Number(submissionDuration) * MIN);
      const resultsDate = new Date(submissionEnd.getTime() + Number(resultsDelay) * MIN);

      const { competition } = await createCompetition({
        title: title.trim(),
        description: description.trim(),
        prizePool: Number(prizePool) || 0,
        entryFee: Number(entryFee) || 0,
        totalSpots: Number(totalSpots) || 1,
        tags: parseTags(tagsCsv),
        perk: perk.trim(),
        judge: judgeName.trim() ? { name: judgeName.trim(), title: judgeTitle.trim() } : undefined,
        rewards: parseRewards(rewardsCsv),
        registrationStart,
        registrationEnd,
        submissionStart,
        submissionEnd,
        resultsDate,
      });
      Alert.alert("Created!", `"${competition.title}" is live.`);
      onCreated(competition._id);
    } catch (e) {
      Alert.alert("Couldn't create competition", e.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.frame}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Competition</Text>
          <View style={{ width: 20 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Title *" value={title} onChangeText={setTitle} placeholder="Feedants Classical Dance" />
          <Field label="Description" value={description} onChangeText={setDescription} multiline />

          <View style={styles.row}>
            <Field label="Prize Pool (₹)" value={prizePool} onChangeText={setPrizePool} keyboardType="numeric" style={styles.half} />
            <Field label="Entry Fee (₹)" value={entryFee} onChangeText={setEntryFee} keyboardType="numeric" style={styles.half} />
          </View>

          <Field label="Total Spots" value={totalSpots} onChangeText={setTotalSpots} keyboardType="numeric" />

          <Text style={styles.sectionLabel}>Lifecycle timing (minutes from now)</Text>
          <View style={styles.row}>
            <Field label="Registration opens in" value={registrationOpensIn} onChangeText={setRegistrationOpensIn} keyboardType="numeric" style={styles.half} />
            <Field label="Registration lasts" value={registrationDuration} onChangeText={setRegistrationDuration} keyboardType="numeric" style={styles.half} />
          </View>
          <View style={styles.row}>
            <Field label="Submission lasts" value={submissionDuration} onChangeText={setSubmissionDuration} keyboardType="numeric" style={styles.half} />
            <Field label="Results after" value={resultsDelay} onChangeText={setResultsDelay} keyboardType="numeric" style={styles.half} />
          </View>

          <Text style={styles.sectionLabel}>Judge (optional)</Text>
          <View style={styles.row}>
            <Field label="Name" value={judgeName} onChangeText={setJudgeName} style={styles.half} />
            <Field label="Title" value={judgeTitle} onChangeText={setJudgeTitle} style={styles.half} />
          </View>

          <Field label="Tags (comma-separated)" value={tagsCsv} onChangeText={setTagsCsv} placeholder="Dance, Multi-Win" />
          <Field label="Perk line" value={perk} onChangeText={setPerk} placeholder="Winners get certificate" />
          <Field label="Rewards (rank:amount, ...)" value={rewardsCsv} onChangeText={setRewardsCsv} />

          <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Competition</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

function Field({ label, style, multiline, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: "center" },
  frame: { flex: 1, width: "100%", maxWidth: maxContentWidth, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  content: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 8, marginBottom: 10 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    ...cardShadow,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
