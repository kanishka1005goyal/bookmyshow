// models/Movie.ts

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMovie extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  language: string;
  genres: string[];
  durationMins: number;
  releaseDate: Date;
  censorRating: "U" | "U/A" | "A" | "S";
  posterUrl?: string;
  trailerUrl?: string;
  cast: string[];
  isActive: boolean;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    genres: { type: [String], default: [] },
    durationMins: { type: Number, required: true },
    releaseDate: { type: Date, required: true },
    censorRating: {
      type: String,
      enum: ["U", "U/A", "A", "S"],
      default: "U/A",
    },
    posterUrl: { type: String },
    trailerUrl: { type: String },
    cast: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Do not apply language stemming, and do not treat the document's
// `language` field as a stemmer-language override.
movieSchema.index(
  { title: "text" },
  { default_language: "none", language_override: "no_language_override" }
);
export default mongoose.model<IMovie>("Movie", movieSchema);