import { z } from "zod";

export const createScreenSchema = z.object({
  theatreId: z.string().min(1),
  name: z.string().min(1),
  screenType: z.enum(["2D", "3D", "IMAX", "4DX"]).optional(),
});

export const updateScreenSchema = createScreenSchema.partial();
