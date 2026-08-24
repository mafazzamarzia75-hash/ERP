import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  credit_limit: z.number().min(0).default(0),
});

export const customerUpdateSchema = customerSchema.partial();