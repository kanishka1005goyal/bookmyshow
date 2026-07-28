import { Router } from "express";
import {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} from "../controllers/theatre.controller";
import { validate } from "../middlewares/validate";
import {
  createTheatreSchema,
  updateTheatreSchema,
} from "../validators/theatre.validator";
import { protect } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// Public
router.get("/", getTheatres);
router.get("/:id", getTheatreById);

// Admin only
router.post("/", protect, requireAdmin, validate(createTheatreSchema), createTheatre);
router.put("/:id", protect, requireAdmin, validate(updateTheatreSchema), updateTheatre);
router.delete("/:id", protect, requireAdmin, deleteTheatre);

export default router;
