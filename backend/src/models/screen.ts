import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScreen extends Document {
  _id: Types.ObjectId;
  theatreId: Types.ObjectId;
  name: string; // e.g. "Screen 1", "IMAX"
  screenType: "2D" | "3D" | "IMAX" | "4DX";
  totalSeats: number; // denormalized count, kept in sync when seats are generated
  isActive: boolean;
}

const screenSchema = new Schema<IScreen>(
  {
    theatreId: { type: Schema.Types.ObjectId, ref: "Theatre", required: true },
    name: { type: String, required: true, trim: true },
    screenType: {
      type: String,
      enum: ["2D", "3D", "IMAX", "4DX"],
      default: "2D",
    },
    totalSeats: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

screenSchema.index({ theatreId: 1 });

export default mongoose.model<IScreen>("Screen", screenSchema);
