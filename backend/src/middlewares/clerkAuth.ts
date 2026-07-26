import { Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import User from "../models/user";
import { CLERK_SECRET_KEY } from "../config/env";
import { AuthRequest } from "./auth.types";

export const protectClerk = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const payload = await verifyToken(token, {
      secretKey: CLERK_SECRET_KEY,
    });

    // Clerk's own user id (e.g. "user_2abc...")
    const clerkId = payload.sub;

    // role can be set in Clerk's publicMetadata; defaults to "user"
    const claimedRole =
      (payload as any)?.publicMetadata?.role === "admin" ? "admin" : "user";

    // Lazily sync the Clerk user into our own DB so the rest of the app
    // (bookings, payments, etc.) can keep working with a normal Mongo _id.
    let user = await User.findOne({ clerkId });

    if (!user) {
      const email =
        (payload as any)?.email ||
        (payload as any)?.email_address ||
        `${clerkId}@clerk.local`;

      user = await User.create({
        clerkId,
        name: (payload as any)?.name || "Clerk User",
        email,
        role: claimedRole,
      });
    }

    req.user = { id: String(user._id), role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
