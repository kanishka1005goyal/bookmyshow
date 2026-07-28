import { Router } from "express";
import {
  getScreensByTheatre,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
} from "../controllers/screen.controller";
import { validate } from "../middlewares/validate";
import { createScreenSchema, updateScreenSchema } from "../validators/screen.validator";
import { protect } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// Public
router.get("/theatre/:theatreId", getScreensByTheatre);
router.get("/:id", getScreenById);

// Admin only
router.post("/", protect, requireAdmin, validate(createScreenSchema), createScreen);
router.put("/:id", protect, requireAdmin, validate(updateScreenSchema), updateScreen);
router.delete("/:id", protect, requireAdmin, deleteScreen);

export default router;
