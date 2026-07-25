import { z } from "zod";

export const generateSeatsSchema = z.object({
  screenId: z.string().min(1),
  rows: z
    .array(
      z.object({
        row: z.string().min(1),
        count: z.number().int().positive().max(100),
        seatType: z.enum(["REGULAR", "PREMIUM", "RECLINER"]).optional(),
        priceMultiplier: z.number().positive().optional(),
      })
    )
    .min(1),
});

export const seatSelectionSchema = z.object({
  showId: z.string().min(1),
  seatIds: z.array(z.string().min(1)).min(1).max(10),
});
