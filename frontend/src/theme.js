// Single source of truth for the teal brand palette used across the screen.
export const colors = {
  primary: "#0d7d74",
  primaryDark: "#0a5f58",
  primaryLight: "#e3f3f1",
  bg: "#f5f8f8",
  card: "#ffffff",
  border: "#e6ecec",
  text: "#0f2e2b",
  textMuted: "#5f7674",
  danger: "#c0392b",
  gold: "#f0a500",
  silver: "#9aa5a5",
  bronze: "#c96a3a",
};

// Shared card shadow — cross-platform (elevation for Android, shadow* for
// iOS/web) instead of a borderWidth-only card, to match the design's raised
// cards.
export const cardShadow = {
  shadowColor: "#0f2e2b",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

// Caps content width on wide viewports (web/desktop) so the layout stays a
// phone-width column instead of stretching edge-to-edge.
export const maxContentWidth = 480;
