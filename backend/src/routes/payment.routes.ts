import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByBooking,
} from "../controllers/payment.controller";
import { validate } from "../middlewares/validate";
import { createOrderSchema, verifyPaymentSchema } from "../validators/payment.validator";
import { protect } from "../middlewares/auth";

const router = Router();

// Auth
router.post("/create-order", protect, validate(createOrderSchema), createOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);
router.get("/booking/:bookingId", protect, getPaymentByBooking);

// Public — hit by Razorpay's servers, verified via webhook signature instead of a user session
router.post("/webhook", handleWebhook);

export default router;
