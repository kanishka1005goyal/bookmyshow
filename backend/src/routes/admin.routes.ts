import { Router } from "express";
import { getDashboard, getAllBookings, getAllUsers } from "../controllers/admin.controller";
import { requireAdmin } from "../middlewares/requireAdmin";
import { protect } from "../middlewares/auth";
const router = Router();

// Dashboard
router.get("/dashboard", protect, requireAdmin, getDashboard);

// Bookings
router.get("/bookings", protect, requireAdmin, getAllBookings);

// Users
router.get("/users", protect, requireAdmin, getAllUsers);

export default router;