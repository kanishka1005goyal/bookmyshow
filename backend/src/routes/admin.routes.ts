import { Router } from "express";
import { getDashboard } from "../controllers/admin.controller";
import { requireAdmin } from "../middlewares/requireAdmin";
import { protect } from "../middlewares/auth";
const router = Router();

// Dashboard
router.get("/dashboard", protect, requireAdmin, getDashboard);

export default router;