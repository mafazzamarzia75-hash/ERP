import { z } from "zod";

export const orderSchema = z.object({
  order_source: z.enum(["pos", "sales", "web"]),
  payment_type: z.enum(["cash", "tempo"]),
  cash_tendered: z.number().min(0).optional(),
  customer_id: z.string().uuid().optional(),
  salesman_id: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "processed", "shipped", "completed", "cancelled"]),
});