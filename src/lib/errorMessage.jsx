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
