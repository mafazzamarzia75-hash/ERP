import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  sku: z.string().optional(),
  price_buy: z.number().min(0, "Harga beli tidak boleh negatif"),
  price_sell: z.number().min(0, "Harga jual tidak boleh negatif"),
  stock_current: z.number().int().min(0, "Stok tidak boleh negatif"),
  stock_min: z.number().int().min(0).default(5),
  is_active: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();