// Turns an axios error into a message that actually says what went
// wrong, instead of a generic fallback that hides the real cause.
// Distinguishes three cases:
//   1. The server responded with its own message — use that.
//   2. The request was sent but nothing came back at all — usually a
//      CORS/network issue, or (as happened once already) a route that
//      isn't deployed yet.
//   3. Something else went wrong before the request was even sent.
export function describeError(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return "";
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return `No response from the server (${error.message}). This usually means a CORS/network issue, or the route isn't deployed yet.`;
  }
  return error.message || fallback;
}

// Firebase Auth errors carry a `.code` like "auth/invalid-credential", but
// `.message` is the raw SDK string — "Firebase: Error (auth/invalid-credential)."
// — which is exactly what was showing up directly in the UI. This maps the
// codes that actually come up in login/registration to plain messages.
// Returns null for a couple of codes that aren't real failures (the user
// closing a Google popup themselves) — callers should treat null as "don't
// show an error banner at all," not as a message to display.
const FIREBASE_AUTH_MESSAGES = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Password is too weak. Please choose a stronger one.",
  "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups for this site and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/network-request-failed": "Network error. Please check your connection and try again.",
};

const SILENT_FIREBASE_CODES = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

export function describeFirebaseAuthError(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return "";
  const code = error.code || "";
  if (SILENT_FIREBASE_CODES.has(code)) return null;
  return FIREBASE_AUTH_MESSAGES[code] || fallback;
}
