import mongoose, { Schema, Document, Types } from "mongoose";

// Physical seat layout for a screen. Generated once per screen (see
// POST /api/seats/generate) and reused across every show on that screen.
export interface ISeat extends Document {
  _id: Types.ObjectId;
  screenId: Types.ObjectId;
  row: string; // e.g. "A", "B"
  seatNumber: number; // e.g. 1, 2, 3
  label: string; // denormalized "A1" for fast display
  seatType: "REGULAR" | "PREMIUM" | "RECLINER";
  priceMultiplier: number; // applied to Show.basePrice, e.g. 1.5 for RECLINER
  isActive: boolean;
}

const seatSchema = new Schema<ISeat>(
  {
    screenId: { type: Schema.Types.ObjectId, ref: "Screen", required: true },
    row: { type: String, required: true, trim: true, uppercase: true },
    seatNumber: { type: Number, required: true, min: 1 },
    label: { type: String, required: true },
    seatType: {
      type: String,
      enum: ["REGULAR", "PREMIUM", "RECLINER"],
      default: "REGULAR",
    },
    priceMultiplier: { type: Number, default: 1, min: 0.1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One seat per row/number per screen
seatSchema.index({ screenId: 1, row: 1, seatNumber: 1 }, { unique: true });
// Fast lookup: "all seats for this screen"
seatSchema.index({ screenId: 1 });

export default mongoose.model<ISeat>("Seat", seatSchema);
