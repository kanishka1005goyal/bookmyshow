import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.types";
import { protectJwt } from "./jwtAuth";
import { protectClerk } from "./clerkAuth";
import { AUTH_PROVIDER } from "../config/env";

export { AuthRequest };

// Single entry point used everywhere in the app.
// Switch auth strategy with AUTH_PROVIDER=jwt|clerk in .env — nothing else changes.
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (AUTH_PROVIDER === "clerk") {
    return protectClerk(req, res, next);
  }
  return protectJwt(req, res, next);
};
