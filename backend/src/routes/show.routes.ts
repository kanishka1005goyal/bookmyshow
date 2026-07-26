import { Router } from "express";
import {
  getShows,
  getShowById,
  getShowsByMovie,
  createShow,
  updateShow,
  deleteShow,
} from "../controllers/show.controller";
import { validate } from "../middlewares/validate";
import { createShowSchema, updateShowSchema } from "../validators/show.validator";
import { protect } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// Public
router.get("/", getShows);
router.get("/movie/:movieId", getShowsByMovie);
router.get("/:id", getShowById);

// Admin only
router.post("/", protect, requireAdmin, validate(createShowSchema), createShow);
router.put("/:id", protect, requireAdmin, validate(updateShowSchema), updateShow);
router.delete("/:id", protect, requireAdmin, deleteShow);

export default router;
