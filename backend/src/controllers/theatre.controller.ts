import { Request, Response } from "express";
import Theatre from "../models/theatre";

// Public: list theatres, optional city filter + pagination
export const getTheatres = async (req: Request, res: Response) => {
  try {
    const { city, page = "1", limit = "20" } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (city) filter.city = new RegExp(`^${String(city)}$`, "i");

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [theatres, total] = await Promise.all([
      Theatre.find(filter)
        .sort({ name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Theatre.countDocuments(filter),
    ]);

    res.status(200).json({
      theatres,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public: single theatre by id
export const getTheatreById = async (req: Request, res: Response) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found" });
    }
    res.status(200).json({ theatre });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only
export const createTheatre = async (req: Request, res: Response) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ theatre });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only
export const updateTheatre = async (req: Request, res: Response) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found" });
    }
    res.status(200).json({ theatre });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only — soft delete (keeps historical shows/bookings intact)
export const deleteTheatre = async (req: Request, res: Response) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found" });
    }
    res.status(200).json({ message: "Theatre deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
