import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/booking.controller";
import { validate } from "../middlewares/validate";
import { createBookingSchema } from "../validators/booking.validator";
import { protect } from "../middlewares/auth";

const router = Router();

// All booking routes require auth
router.post("/", protect, validate(createBookingSchema), createBooking);
router.get("/me", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
