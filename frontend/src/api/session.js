import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "feedants_current_user";

// { userId, name, email } persisted on-device so "who am I" survives a
// reload — this is a stand-in for real login, not real auth.
export async function getSession() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setSession(user) {
  await AsyncStorage.setItem(KEY, JSON.stringify(user));
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEY);
}
