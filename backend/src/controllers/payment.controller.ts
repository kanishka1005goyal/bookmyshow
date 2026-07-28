import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth.types";
import Booking from "../models/booking";
import Payment from "../models/payment";
import { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from "../services/payment.service";
import { RAZORPAY_WEBHOOK_SECRET } from "../libs/razorpay";
import { confirmBooking } from "./booking.controller";

// Auth: create a Razorpay order for a PENDING_PAYMENT booking the caller owns.
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body as { bookingId: string };
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (String(booking.userId) !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (booking.status !== "PENDING_PAYMENT") {
      return res.status(400).json({ message: `Booking is ${booking.status}, cannot pay` });
    }
    if (booking.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: "Booking hold has expired" });
    }

    const order = await createRazorpayOrder(booking.totalAmount, String(booking._id));
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user!.id,
      amount: booking.totalAmount,
      razorpayOrderId: order.id,
      status: "CREATED",
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: called by the frontend from Razorpay checkout's success handler.
// Verifies the signature, marks the payment PAID and the booking CONFIRMED.
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body as {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    };

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (String(payment.userId) !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      payment.status = "FAILED";
      await payment.save();
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "PAID";
    await payment.save();

    const booking = await confirmBooking(String(payment.bookingId), String(payment._id));

    res.status(200).json({ message: "Payment verified", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public (called by Razorpay, not the browser): async confirmation via
// webhook, in case the client never returns to hit /verify (closed tab, etc).
// Requires app.ts to capture the raw body via express.json({ verify }) so we
// can check the HMAC signature against the exact bytes Razorpay signed.
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!signature || !rawBody || !RAZORPAY_WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Missing signature or webhook secret not configured" });
    }

    const isValid = verifyWebhookSignature(rawBody.toString("utf8"), signature, RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;
    if (event.event === "payment.captured") {
      const orderId = event.payload.payment.entity.order_id;
      const paymentId = event.payload.payment.entity.id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== "PAID") {
        payment.razorpayPaymentId = paymentId;
        payment.status = "PAID";
        await payment.save();
        await confirmBooking(String(payment.bookingId), String(payment._id));
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: booking history's per-payment detail, if the frontend needs it separately
export const getPaymentByBooking = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (String(payment.userId) !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.status(200).json({ payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
