import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCompetition, getMyState, registerForCompetition, submitEntry } from "../api/client";
import { colors, cardShadow, maxContentWidth } from "../theme";
import TopHeader from "../components/TopHeader";
import CountdownTimer from "../components/CountdownTimer";
import JudgeCard from "../components/JudgeCard";
import ImportantDates from "../components/ImportantDates";
import WinnersList from "../components/WinnersList";
import RewardsTable from "../components/RewardsTable";
import TabsView from "../components/TabsView";
import ReferralCard from "../components/ReferralCard";
import TrustRow from "../components/TrustRow";
import BottomNavBar from "../components/BottomNavBar";
import DisclaimerBanner from "../components/DisclaimerBanner";

// Re-fetch lifecycle/my-state periodically so a stale countdown or a spot
// count that changed on the server (someone else registered) self-corrects
// without the user having to leave and re-enter the screen.
const POLL_INTERVAL_MS = 15000;

export default function CompetitionDetailsScreen({ route, session, onSwitchUser, onCreateCompetition }) {
  const competitionId = route?.params?.competitionId;

  const [competition, setCompetition] = useState(null);
  const [lifecycle, setLifecycle] = useState(null);
  const [myState, setMyState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const load = useCallback(async () => {
    try {
      const [compRes, meRes] = await Promise.all([
        getCompetition(competitionId),
        getMyState(competitionId),
      ]);
      setCompetition(compRes.competition);
      setLifecycle(compRes.lifecycle);
      setMyState(meRes);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await registerForCompetition(competitionId, referralCodeInput.trim() || undefined);
      await load();
      Alert.alert("Registered!", "You're in. Good luck!");
    } catch (e) {
      Alert.alert("Couldn't register", e.data?.error || e.message);
      await load(); // pull the real state after a failed race
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpload = async () => {
    // Placeholder file URL — a real build wires this to an image/file picker
    // and an upload step (S3/Cloudinary) that returns the hosted URL.
    setActionLoading(true);
    try {
      await submitEntry(competitionId, "https://example.com/my-submission.jpg", "");
      await load();
      Alert.alert("Submitted!", "Your entry is in.");
    } catch (e) {
      Alert.alert("Couldn't submit", e.data?.error || e.message);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !competition) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Competition not found"}</Text>
      </View>
    );
  }

  const state = lifecycle.state;
  const spotsLeft = lifecycle.spotsLeft;
  const spotsBooked = competition.totalSpots - spotsLeft;
  const spotsFraction = spotsBooked / competition.totalSpots;
  const action = resolveAction(state, myState);

  return (
    <View style={styles.root}>
      <View style={styles.frame}>
        <TopHeader />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {session ? (
            <View style={styles.sessionRow}>
              <Text style={styles.sessionText}>
                Testing as <Text style={styles.sessionBold}>{session.name}</Text> ({session.email})
              </Text>
              <TouchableOpacity onPress={onSwitchUser}>
                <Text style={styles.switchUserLink}>Switch user</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Header card */}
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{competition.title}</Text>
              {myState?.isRegistered ? (
                <View style={styles.registeredBadge}>
                  <Text style={styles.registeredBadgeText}>✓ Registered</Text>
                </View>
              ) : null}
            </View>

            {competition.tags?.length || competition.perk ? (
              <View style={styles.tagsRow}>
                {competition.tags?.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </View>
                ))}
                {competition.perk ? (
                  <View style={styles.perkChip}>
                    <Ionicons name="trophy-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.perkChipText}>{competition.perk}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <Stat label="Prize Pool" value={`₹${competition.prizePool.toLocaleString()}`} />
              <Stat label="Entry Fee" value={competition.entryFee > 0 ? `₹${competition.entryFee}` : "Free"} />
            </View>

            <View style={styles.spotsBlock}>
              <View style={styles.spotsLabelRow}>
                <Ionicons name="people-outline" size={13} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={styles.spotsLabel}>Only {spotsLeft} spots left</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(spotsFraction * 100, 100)}%` }]} />
              </View>
              <Text style={styles.spotsSubLabel}>{spotsBooked} / {competition.totalSpots} Booked</Text>
            </View>
          </View>

          <JudgeCard judge={competition.judge} />

        <CountdownTimer
          label={
            state === "registration_open"
              ? "Registration closes in"
              : state === "submission_open"
              ? "Submissions close in"
              : state === "upcoming"
              ? "Registration opens in"
              : "Results in"
          }
          targetDate={
            new Date(
              state === "registration_open"
                ? lifecycle.deadlines.registrationEnd
                : state === "submission_open"
                ? lifecycle.deadlines.submissionEnd
                : state === "upcoming"
                ? lifecycle.deadlines.registrationStart
                : lifecycle.deadlines.resultsDate
            ).getTime()
          }
        />

        <ImportantDates deadlines={lifecycle.deadlines} />

        <Text style={styles.sectionHeading}>Previous Winners</Text>
        <View style={{ marginBottom: 12 }}>
          <WinnersList winners={competition.previousWinners} />
        </View>

        <TabsView
          tabs={[
            { key: "about", label: "About", content: competition.description },
            { key: "rules", label: "Rules", content: competition.rules },
            { key: "faq", label: "FAQ", content: competition.faq },
          ]}
        />

        <RewardsTable rewards={competition.rewards} />

        <DisclaimerBanner text={competition.disclaimer} />

        <TrustRow />

        <ReferralCard referral={myState?.referral} />
      </ScrollView>

        <BottomNavBar onCreate={onCreateCompetition} />
        <View style={styles.bottomBar}>
          {action.type === "register" ? (
            <TextInput
              style={styles.referralInput}
              placeholder="Have a referral code? (optional)"
              placeholderTextColor={colors.textMuted}
              value={referralCodeInput}
              onChangeText={setReferralCodeInput}
              autoCapitalize="none"
            />
          ) : null}
          <ActionButton action={action} loading={actionLoading} onRegister={handleRegister} onUpload={handleUpload} />
        </View>
      </View>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// The button's label/enabled-ness is a pure function of server state —
// it never independently decides "is registration open" from a local clock.
function resolveAction(state, myState) {
  if (myState?.hasSubmitted) return { type: "banner", text: "Entry submitted ✓" };
  if (state === "submission_open") {
    if (!myState?.isRegistered) return { type: "banner", text: "Registration closed — you didn't register in time", disabled: true };
    return { type: "upload", text: "Upload Submission" };
  }
  if (myState?.isRegistered) return { type: "banner", text: "You're registered ✓" };
  if (state === "registration_open") return { type: "register", text: "Register Now" };
  if (state === "registration_full") return { type: "banner", text: "Registration full", disabled: true };
  if (state === "upcoming") return { type: "banner", text: "Registration opens soon", disabled: true };
  if (state === "registration_closed") return { type: "banner", text: "Registration closed", disabled: true };
  if (state === "submission_closed") return { type: "banner", text: "Submissions closed", disabled: true };
  return { type: "banner", text: "Results declared" };
}

function ActionButton({ action, loading, onRegister, onUpload }) {
  if (action.type === "register" || action.type === "upload") {
    return (
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={action.type === "register" ? onRegister : onUpload}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{action.text}</Text>}
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.bannerButton, action.disabled && styles.bannerButtonDisabled]}>
      <Text style={styles.bannerButtonText}>{action.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: "center" },
  // Caps the whole screen to a phone-width column so it doesn't stretch
  // edge-to-edge on a wide viewport (web/desktop preview); harmless on an
  // actual phone since the device width is already under this.
  frame: { flex: 1, width: "100%", maxWidth: maxContentWidth, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  errorText: { color: colors.danger },

  sessionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sessionText: { fontSize: 11, color: colors.textMuted, flex: 1, marginRight: 8 },
  sessionBold: { fontWeight: "700", color: colors.text },
  switchUserLink: { fontSize: 11, color: colors.primary, fontWeight: "700" },

  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { flex: 1, fontSize: 19, fontWeight: "800", color: colors.text, marginRight: 8 },
  registeredBadge: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  registeredBadgeText: { color: colors.primary, fontSize: 12, fontWeight: "700" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  tagChip: { backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 6 },
  tagChipText: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  perkChip: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  perkChipText: { fontSize: 11, color: colors.primary, fontWeight: "700" },

  statsRow: { flexDirection: "row", marginTop: 14, marginBottom: 16 },
  stat: { marginRight: 32 },
  statLabel: { fontSize: 11, color: colors.textMuted },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.primary, marginTop: 2 },

  spotsBlock: {},
  spotsLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  spotsLabel: { fontSize: 12, color: colors.text, fontWeight: "600" },
  progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  spotsSubLabel: { fontSize: 11, color: colors.textMuted, marginTop: 6 },

  sectionHeading: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 8 },

  bottomBar: {
    padding: 14,
    paddingBottom: 18,
    backgroundColor: colors.card,
    shadowColor: "#0f2e2b",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  referralInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    marginBottom: 10,
  },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  bannerButton: { backgroundColor: colors.primaryLight, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  bannerButtonDisabled: { backgroundColor: colors.bg },
  bannerButtonText: { fontWeight: "600", color: colors.primaryDark },
});
