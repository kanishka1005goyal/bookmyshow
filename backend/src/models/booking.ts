import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBookingSeat {
  seatId: Types.ObjectId;
  label: string;
  price: number;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  showId: Types.ObjectId;
  seats: IBookingSeat[];
  totalAmount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  paymentId?: Types.ObjectId;
  expiresAt: Date; // PENDING_PAYMENT bookings auto-expire if payment isn't completed
}

const bookingSeatSchema = new Schema<IBookingSeat>(
  {
    seatId: { type: Schema.Types.ObjectId, ref: "Seat", required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    showId: { type: Schema.Types.ObjectId, ref: "Show", required: true },
    seats: { type: [bookingSeatSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "EXPIRED"],
      default: "PENDING_PAYMENT",
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    // TTL-backed hold: if payment doesn't land within this window the booking
    // (and its seat locks) are released. Cleared once status becomes CONFIRMED.
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Fast lookup: "my bookings" / booking history
bookingSchema.index({ userId: 1, createdAt: -1 });
// Prevent double-selling the same seat on the same show at the DB level too
bookingSchema.index({ showId: 1, "seats.seatId": 1 });
// Auto-expire stale PENDING_PAYMENT bookings (Mongo TTL monitor sweeps ~every 60s)
bookingSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "PENDING_PAYMENT" } }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
