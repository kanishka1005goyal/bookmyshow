import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  language: z.string().min(1),
  genres: z.array(z.string()).optional(),
  durationMins: z.number().int().positive(),
  releaseDate: z.coerce.date(),
  censorRating: z.enum(["U", "U/A", "A", "S"]).optional(),
  posterUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  cast: z.array(z.string()).optional(),
});

export const updateMovieSchema = createMovieSchema.partial();
