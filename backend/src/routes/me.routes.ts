import { Router, Response } from "express";
import { protect, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/me", protect, (req: AuthRequest, res: Response) => {
  res.status(200).json({ user: req.user });
});

export default router;
