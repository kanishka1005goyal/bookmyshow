import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.types";
import Seat from "../models/seat";
import Screen from "../models/screen";
import Show from "../models/show";
import Booking from "../models/booking";
import { lockSeats as lockSeatsInRedis, unlockSeats as unlockSeatsInRedis, getLockedSeatMap } from "../services/seatLock.service";

// Admin only: generate the physical seat layout for a screen in one go.
// body: { screenId, rows: [{ row, count, seatType?, priceMultiplier? }] }
export const generateSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { screenId, rows } = req.body as {
      screenId: string;
      rows: { row: string; count: number; seatType?: string; priceMultiplier?: number }[];
    };

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(400).json({ message: "Invalid screenId" });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "rows must be a non-empty array" });
    }

    const docs = rows.flatMap((r) =>
      Array.from({ length: r.count }, (_, i) => ({
        screenId,
        row: r.row,
        seatNumber: i + 1,
        label: `${r.row.toUpperCase()}${i + 1}`,
        seatType: r.seatType || "REGULAR",
        priceMultiplier: r.priceMultiplier ?? 1,
      }))
    );

    // Wipe any existing layout for this screen and replace it (keeps this
    // endpoint idempotent/re-runnable while a screen's plan is still being set up)
    await Seat.deleteMany({ screenId });
    const seats = await Seat.insertMany(docs);
    screen.totalSeats = seats.length;
    await screen.save();

    res.status(201).json({ seats });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/internal: raw seat layout for a screen (no booking/lock status)
export const getSeatsByScreen = async (req: AuthRequest, res: Response) => {
  try {
    const seats = await Seat.find({ screenId: req.params.screenId, isActive: true }).sort({
      row: 1,
      seatNumber: 1,
    });
    res.status(200).json({ seats });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public: live seat map for a show — AVAILABLE / LOCKED / BOOKED per seat,
// with price (Show.basePrice * seat.priceMultiplier).
export const getSeatMapForShow = async (req: AuthRequest, res: Response) => {
  try {
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    const seats = await Seat.find({ screenId: show.screenId, isActive: true }).sort({
      row: 1,
      seatNumber: 1,
    });
    const seatIds = seats.map((s) => String(s._id));

    const [lockedMap, booking] = await Promise.all([
      getLockedSeatMap(String(show._id), seatIds),
      Booking.find({ showId: show._id, status: { $in: ["PENDING_PAYMENT", "CONFIRMED"] } }).select("seats.seatId status"),
    ]);

    const bookedSeatIds = new Set(
      booking.flatMap((b) => (b.status === "CONFIRMED" ? b.seats.map((s) => String(s.seatId)) : []))
    );

    const seatMap = seats.map((seat) => {
      const id = String(seat._id);
      let status: "AVAILABLE" | "LOCKED" | "BOOKED" = "AVAILABLE";
      if (bookedSeatIds.has(id)) status = "BOOKED";
      else if (lockedMap[id]) status = "LOCKED";

      return {
        seatId: id,
        label: seat.label,
        row: seat.row,
        seatType: seat.seatType,
        price: Math.round(show.basePrice * seat.priceMultiplier * 100) / 100,
        status,
        lockedByMe: lockedMap[id] === req.user?.id,
      };
    });

    res.status(200).json({ showId: show._id, seats: seatMap });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: place a short-lived hold on seats for a show before checkout.
export const holdSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { showId, seatIds } = req.body as { showId: string; seatIds: string[] };
    const userId = req.user!.id;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    const validSeats = await Seat.find({ _id: { $in: seatIds }, screenId: show.screenId, isActive: true });
    if (validSeats.length !== seatIds.length) {
      return res.status(400).json({ message: "One or more seatIds are invalid for this show" });
    }

    const alreadyBooked = await Booking.exists({
      showId,
      status: "CONFIRMED",
      "seats.seatId": { $in: seatIds },
    });
    if (alreadyBooked) {
      return res.status(409).json({ message: "One or more seats are already booked" });
    }

    const result = await lockSeatsInRedis(showId, seatIds, userId);
    if (!result.success) {
      return res.status(409).json({ message: "Seat already held by another user", seatId: result.conflictSeatId });
    }

    res.status(200).json({ message: "Seats held", showId, seatIds, holdSeconds: 300 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth: release a hold early (e.g. user navigates away / deselects seats)
export const releaseSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { showId, seatIds } = req.body as { showId: string; seatIds: string[] };
    await unlockSeatsInRedis(showId, seatIds, req.user!.id);
    res.status(200).json({ message: "Seats released" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
