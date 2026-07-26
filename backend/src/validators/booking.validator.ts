import { z } from "zod";

export const createBookingSchema = z.object({
  showId: z.string().min(1),
  seatIds: z.array(z.string().min(1)).min(1).max(10),
});
