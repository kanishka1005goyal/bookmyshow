import { Request, Response } from "express";
import Show from "../models/show";

// Public: list shows with optional filters (movieId, theatreId, screenId, date)
// date is a "YYYY-MM-DD" string; when provided, matches shows starting that day
export const getShows = async (req: Request, res: Response) => {
  try {
    const { movieId, theatreId, screenId, date, page = "1", limit = "20" } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (movieId) filter.movieId = movieId;
    if (theatreId) filter.theatreId = theatreId;
    if (screenId) filter.screenId = screenId;

    if (date) {
      const dayStart = new Date(`${String(date)}T00:00:00.000Z`);
      if (isNaN(dayStart.getTime())) {
        return res.status(400).json({ message: "Invalid date, expected YYYY-MM-DD" });
      }
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      filter.startTime = { $gte: dayStart, $lt: dayEnd };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [shows, total] = await Promise.all([
      Show.find(filter)
        .populate("movieId", "title language durationMins posterUrl")
        .populate("theatreId", "name city")
        .populate("screenId", "name screenType")
        .sort({ startTime: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Show.countDocuments(filter),
    ]);

    res.status(200).json({
      shows,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public: single show by id, fully populated
export const getShowById = async (req: Request, res: Response) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movieId", "title language durationMins posterUrl censorRating")
      .populate("theatreId", "name city address")
      .populate("screenId", "name screenType totalSeats");
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json({ show });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public: all upcoming shows for a given movie, grouped implicitly by sort order
// (frontend groups by theatre/date as needed)
export const getShowsByMovie = async (req: Request, res: Response) => {
  try {
    const { city, date } = req.query;
    const filter: Record<string, unknown> = {
      movieId: req.params.movieId,
      isActive: true,
      startTime: { $gte: new Date() },
    };

    if (date) {
      const dayStart = new Date(`${String(date)}T00:00:00.000Z`);
      if (isNaN(dayStart.getTime())) {
        return res.status(400).json({ message: "Invalid date, expected YYYY-MM-DD" });
      }
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      filter.startTime = { $gte: dayStart, $lt: dayEnd };
    }

    let shows = await Show.find(filter)
      .populate("theatreId", "name city address")
      .populate("screenId", "name screenType")
      .sort({ startTime: 1 });

    if (city) {
      const cityLower = String(city).toLowerCase();
      shows = shows.filter(
        (s: any) => s.theatreId && s.theatreId.city?.toLowerCase() === cityLower
      );
    }

    res.status(200).json({ shows });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only
export const createShow = async (req: Request, res: Response) => {
  try {
    const show = await Show.create(req.body);
    res.status(201).json({ show });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only
export const updateShow = async (req: Request, res: Response) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json({ show });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only — soft delete (keeps historical bookings intact)
export const deleteShow = async (req: Request, res: Response) => {
  try {
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json({ message: "Show deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
