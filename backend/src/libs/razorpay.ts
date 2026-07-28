import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || "").trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || "").trim();
export const RAZORPAY_WEBHOOK_SECRET = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  // Don't crash the whole app on boot (other APIs should still work in dev
  // without payment keys configured) — the Razorpay SDK itself throws
  // synchronously if key_id is empty, so we only construct it lazily,
  // the first time a payment route actually needs it.
  console.warn("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — payment routes will fail until configured");
}

let client: Razorpay | null = null;

// Lazily constructs (and caches) the Razorpay client. Throws a clear error
// only when a payment route is actually hit without keys configured,
// instead of crashing the whole server at import time.
export function getRazorpay(): Razorpay {
  if (client) return client;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  client = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  return client;
}
