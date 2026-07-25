import { Request, Response } from "express";
import Movie from "../models/movie";

// Public: list movies, with optional search/filter + pagination
export const getMovies = async (req: Request, res: Response) => {
  try {
    const { search, language, genre, page = "1", limit = "20" } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (search) filter.$text = { $search: String(search) };
    if (language) filter.language = language;
    if (genre) filter.genres = genre;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ releaseDate: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Movie.countDocuments(filter),
    ]);

    res.status(200).json({
      movies,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public: single movie by id
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ movie });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/admin.ts
export const createMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ movie });
  } catch (err) {
    console.error("createMovie error:", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Server error" });
  }
};
// Admin only

  

// Admin only
export const updateMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ movie });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only — soft delete (keeps historical shows/bookings intact)
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ message: "Movie deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
