import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.types";
import Booking from "../models/booking";
import Seat from "../models/seat";
import Show from "../models/show";
import { verifyOwnedLocks, unlockSeats } from "../services/seatLock.service";

const HOLD_MINUTES = 5;

// Auth: convert a set of held seats into a booking. Requires the caller to
// currently hold the Redis lock on every seat (see Seat API: /lock).
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { showId, seatIds } = req.body as { showId: string; seatIds: string[] };
    const userId = req.user!.id;

    const show = await Show.findById(showId);
    if (!show || !show.isActive) {
      return res.status(404).json({ message: "Show not found" });
    }

    const seats = await Seat.find({ _id: { $in: seatIds }, screenId: show.screenId, isActive: true });
    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: "One or more seatIds are invalid for this show" });
    }

    const ownsAllLocks = await verifyOwnedLocks(showId, seatIds, userId);
    if (!ownsAllLocks) {
      return res.status(409).json({ message: "Your hold on one or more seats has expired. Please reselect." });
    }

    const alreadyBooked = await Booking.exists({
      showId,
      status: "CONFIRMED",
      "seats.seatId": { $in: seatIds },
    });
    if (alreadyBooked) {
      return res.status(409).json({ message: "One or more seats are already booked" });
    }

    const bookingSeats = seats.map((seat) => ({
      seatId: seat._id,
      label: seat.label,
      price: Math.round(show.basePrice * seat.priceMultiplier * 100) / 100,
    }));
    const totalAmount = bookingSeats.reduce((sum, s) => sum + s.price, 0);

    const booking = await Booking.create({
      userId,
      showId,
      seats: bookingSeats,
      totalAmount,
      status: "PENDING_PAYMENT",
      expiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
    });

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: booking history for the logged-in user
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user!.id })
      .populate({ path: "showId", populate: [{ path: "movieId", select: "title posterUrl" }, { path: "theatreId", select: "name city" }] })
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: single booking, owner (or admin) only
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "showId",
      populate: [{ path: "movieId", select: "title posterUrl" }, { path: "theatreId", select: "name city" }],
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (String(booking.userId) !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.status(200).json({ booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: cancel a booking that hasn't been paid for yet, and release its holds
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (String(booking.userId) !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (booking.status !== "PENDING_PAYMENT") {
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = "CANCELLED";
    await booking.save();
    await unlockSeats(
      String(booking.showId),
      booking.seats.map((s) => String(s.seatId)),
      req.user!.id
    );

    res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Internal helper (called by the Payment API on successful payment) —
// not exposed as its own route.
export const confirmBooking = async (bookingId: string, paymentId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  booking.status = "CONFIRMED";
  booking.paymentId = paymentId as unknown as typeof booking.paymentId;
  await booking.save();
  return booking;
};
