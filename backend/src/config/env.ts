export const AUTH_PROVIDER = (
  (process.env.AUTH_PROVIDER || "jwt").trim()
) as "jwt" | "clerk";

export const isClerkAuth = AUTH_PROVIDER === "clerk";
export const isJwtAuth = AUTH_PROVIDER === "jwt";

export const CLERK_SECRET_KEY = (process.env.CLERK_SECRET_KEY || "").trim();
