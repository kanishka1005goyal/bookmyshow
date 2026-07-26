import mongoose, { Schema, Document, Types } from "mongoose";

export interface IShow extends Document {
  _id: Types.ObjectId;
  movieId: Types.ObjectId;
  theatreId: Types.ObjectId;
  screenId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  language: string;
  format: "2D" | "3D" | "IMAX" | "4DX";
  basePrice: number;
  isActive: boolean;
}

const showSchema = new Schema<IShow>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    theatreId: { type: Schema.Types.ObjectId, ref: "Theatre", required: true },
    screenId: { type: Schema.Types.ObjectId, ref: "Screen", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    language: { type: String, required: true },
    format: {
      type: String,
      enum: ["2D", "3D", "IMAX", "4DX"],
      default: "2D",
    },
    basePrice: { type: Number, required: true, min: 0 },
    // soft-disable a show instead of deleting it (keeps historical bookings intact)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Fast lookup: "what's showing at this theatre/screen, and when"
showSchema.index({ theatreId: 1, screenId: 1, startTime: 1 });
// Fast lookup: "what shows exist for this movie"
showSchema.index({ movieId: 1, startTime: 1 });

export default mongoose.model<IShow>("Show", showSchema);
