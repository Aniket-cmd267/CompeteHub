import { getSession } from "./session";

// Point this at your machine's LAN IP when testing on a physical device —
// "localhost" from the phone/emulator does not reach your dev machine.
// Android emulator (not a physical device) can use 10.0.2.2 instead.
const BASE_URL = "http://192.168.29.185:4000/api";

async function request(path, { method = "GET", body, skipAuth = false } = {}) {
  const headers = { "content-type": "application/json" };
  if (!skipAuth) {
    const session = await getSession();
    if (session?.userId) headers["x-user-id"] = session.userId;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Public — no x-user-id needed to create an account.
export const createUser = (name, email) =>
  request(`/users`, { method: "POST", body: { name, email }, skipAuth: true });

export const listCompetitions = () => request(`/competitions`);
export const createCompetition = (payload) =>
  request(`/competitions`, { method: "POST", body: payload, skipAuth: true });
export const getCompetition = (id) => request(`/competitions/${id}`);
export const getMyState = (id) => request(`/competitions/${id}/me`);
export const registerForCompetition = (id, referralCode) =>
  request(`/competitions/${id}/register`, {
    method: "POST",
    body: referralCode ? { referralCode } : undefined,
  });
export const submitEntry = (id, fileUrl, note) =>
  request(`/competitions/${id}/submit`, { method: "POST", body: { fileUrl, note } });
