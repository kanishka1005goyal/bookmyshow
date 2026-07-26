import { Router } from "express";
import {
  generateSeats,
  getSeatsByScreen,
  getSeatMapForShow,
  holdSeats,
  releaseSeats,
} from "../controllers/seat.controller";
import { validate } from "../middlewares/validate";
import { generateSeatsSchema, seatSelectionSchema } from "../validators/seat.validator";
import { protect } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// Public
router.get("/screen/:screenId", getSeatsByScreen);
router.get("/show/:showId", getSeatMapForShow);

// Auth (any logged-in user)
router.post("/lock", protect, validate(seatSelectionSchema), holdSeats);
router.post("/unlock", protect, validate(seatSelectionSchema), releaseSeats);

// Admin only
router.post("/generate", protect, requireAdmin, validate(generateSeatsSchema), generateSeats);

export default router;
