import { Router } from "express";
import {
  getMovies,
  getMovieById,
  getMovieFilters,  
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller";
import { validate } from "../middlewares/validate";
import { createMovieSchema, updateMovieSchema } from "../validators/movie.validator";
import { protect } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// Public
router.get("/", getMovies);
router.get("/meta/filters", getMovieFilters);
router.get("/:id", getMovieById);

// Admin only
router.post("/", protect, requireAdmin, validate(createMovieSchema), createMovie);
router.put("/:id", protect, requireAdmin, validate(updateMovieSchema), updateMovie);
router.delete("/:id", protect, requireAdmin, deleteMovie);

export default router;
