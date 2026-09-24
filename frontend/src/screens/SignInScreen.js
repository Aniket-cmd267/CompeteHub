import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createUser } from "../api/client";
import { setSession } from "../api/session";
import { colors, cardShadow, maxContentWidth } from "../theme";

// Stand-in for real login: creates a real User document (or fails if the
// email is taken) and stores its id on-device. This exists so manual
// multi-user testing (referrals, concurrent registration) can be done
// entirely from the UI — enter a different name/email to act as a
// different account, no scripts/Postman needed.
export default function SignInScreen({ onSignedIn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing info", "Enter both a name and an email.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUser(name.trim(), email.trim().toLowerCase());
      const session = { userId: user._id, name: user.name, email: user.email };
      await setSession(session);
      onSignedIn(session);
    } catch (e) {
      if (e.status === 409) {
        Alert.alert(
          "Email already used",
          "That email belongs to an existing test account. Use a different email to create a new one."
        );
      } else {
        Alert.alert("Couldn't sign in", e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Who's testing?</Text>
        <Text style={styles.subtitle}>
          Enter a name and email to create a test account. Use a different email to switch
          between accounts (e.g. to test referrals or double-registration).
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: 20 },
  // Same phone-width cap as the details screen's `frame`, so the sign-in
  // card doesn't stretch edge-to-edge on a wide viewport (web/desktop).
  card: { width: "100%", maxWidth: maxContentWidth - 40, backgroundColor: colors.card, borderRadius: 18, padding: 20, ...cardShadow },
  title: { fontSize: 19, fontWeight: "800", color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 18, lineHeight: 17 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
