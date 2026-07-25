import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import meRoutes from "./routes/me.routes";
import movieRoutes from "./routes/movie.routes";
import theatreRoutes from "./routes/theatre.routes";
import screenRoutes from "./routes/screen.routes";
import showRoutes from "./routes/show.routes";
import seatRoutes from "./routes/seat.routes";
import bookingRoutes from "./routes/booking.routes";
import paymentRoutes from "./routes/payment.routes";
import { AUTH_PROVIDER } from "./config/env";
import adminRoutes from "./routes/admin.routes";
const app = express();       // pehle declare

// `verify` stashes the exact raw bytes on req.rawBody — needed by the
// Razorpay webhook handler to check the HMAC signature against what
// Razorpay actually signed (a re-serialized JSON object won't match).
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);
app.use(cors());
app.use(helmet());
app.use(express.static("public"));

// /register & /login (email+password+JWT) only make sense in "jwt" mode.
// In "clerk" mode, the frontend Clerk SDK handles signup/login directly,
// backend only ever verifies the Clerk token via the `protect` middleware.
if (AUTH_PROVIDER === "jwt") {
  app.use("/api/auth", authRoutes);
}

app.use("/api", meRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
export default app;