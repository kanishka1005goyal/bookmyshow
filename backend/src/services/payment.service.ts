import crypto from "crypto";
import { getRazorpay } from "../libs/razorpay";

const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || "").trim();

// Amount comes in as rupees (e.g. Booking.totalAmount); Razorpay wants paise.
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  const order = await getRazorpay().orders.create({
    amount: Math.round(amountRupees * 100),
    currency: "INR",
    receipt,
  });
  return order;
}

// Verifies the signature returned by Razorpay's checkout callback
// (order_id + payment_id, HMAC-SHA256 signed with the key secret).
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, razorpaySignature);
}

// Verifies the signature Razorpay sends in the X-Razorpay-Signature header
// on webhook events (HMAC-SHA256 of the raw request body, signed with the
// separate webhook secret configured in the Razorpay dashboard).
export function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
