import { z } from "zod";

export const createShowSchema = z
  .object({
    movieId: z.string().min(1),
    theatreId: z.string().min(1),
    screenId: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    language: z.string().min(1),
    format: z.enum(["2D", "3D", "IMAX", "4DX"]).optional(),
    basePrice: z.number().positive(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const updateShowSchema = z
  .object({
    movieId: z.string().min(1),
    theatreId: z.string().min(1),
    screenId: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    language: z.string().min(1),
    format: z.enum(["2D", "3D", "IMAX", "4DX"]),
    basePrice: z.number().positive(),
  })
  .partial();
