import { Request, Response } from "express";
import Movie from "../models/movie";
import Booking from "../models/booking";
import Show from "../models/show";
import User from "../models/user";
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const totalMovies = await Movie.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const totalUsers = await User.countDocuments();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todaysShows = await Show.countDocuments({
      showDate: {
        $gte: start,
        $lte: end,
      },
    });

    const recentMovies = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(5);
const recentBookings = await Booking.find()
  .populate({ path: "userId", select: "name email" })
  .populate({
    path: "showId",
    populate: [{ path: "movieId", select: "title posterUrl" }],
  })
  .sort({ createdAt: -1 })
  .limit(5);
    // Revenue (change this field if your Booking model uses another name)
    const revenueResult = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const revenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      stats: {
        totalMovies,
        todaysShows,
        totalBookings,
        totalUsers,
        revenue,
      },
      recentMovies,
      recentBookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);

    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load users",
    });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate({ path: "userId", select: "name email" })
        .populate({
          path: "showId",
          populate: [
            { path: "movieId", select: "title posterUrl" },
            { path: "theatreId", select: "name city" },
          ],
        })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load bookings",
    });
  }
};