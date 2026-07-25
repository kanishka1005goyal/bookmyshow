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