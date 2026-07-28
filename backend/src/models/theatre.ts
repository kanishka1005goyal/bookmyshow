import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITheatre extends Document {
  _id: Types.ObjectId;
  name: string;
  city: string;
  address: string;
  amenities: string[];
  isActive: boolean;
}

const theatreSchema = new Schema<ITheatre>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    amenities: { type: [String], default: [] }, // e.g. "Parking", "Food Court", "Wheelchair Access"
    // soft-disable instead of hard delete (keeps historical shows/bookings intact)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

theatreSchema.index({ city: 1 });

export default mongoose.model<ITheatre>("Theatre", theatreSchema);
