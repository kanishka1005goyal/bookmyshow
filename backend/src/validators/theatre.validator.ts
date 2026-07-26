import { z } from "zod";

export const createTheatreSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  amenities: z.array(z.string()).optional(),
});

export const updateTheatreSchema = createTheatreSchema.partial();
