import { createClient } from "@/lib/supabase/server";

type StockReason = "sale" | "restock" | "adjustment" | "return";

interface StockMovementInput {
  productId: string;
  changeAmount: number;
  reason: StockReason;
  note?: string;
}

/**
 * Mencatat mutasi stok dan mengupdate stok produk.
 * - changeAmount positif = stok masuk (restock/return)
 * - changeAmount negatif = stok keluar (sale/adjustment)
 */
export async function recordStockMovement(input: StockMovementInput): Promise<void> {
  const supabase = createClient();

  // ===== VALIDASI: Produk harus ada =====
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, stock_current")
    .eq("id", input.productId)
    .single();

  if (productError) throw new Error("Produk tidak ditemukan");

  // ===== VALIDASI: Stok tidak boleh negatif =====
  const newStock = product.stock_current + input.changeAmount;
  if (newStock < 0) {
    throw new Error("Stok tidak boleh negatif");
  }

  // ===== UPDATE STOK PRODUK =====
  const { error: updateError } = await supabase
    .from("products")
    .update({ stock_current: newStock })
    .eq("id", input.productId);

  if (updateError) throw updateError;

  // ===== CATAT MUTASI =====
  const { error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      product_id: input.productId,
      change_amount: input.changeAmount,
      reason: input.reason,
    });

  if (movementError) throw movementError;
}

/**
 * Mendapatkan daftar produk dengan stok menipis (di bawah ambang minimum).
 */
export async function getLowStockProducts() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .lte("stock_current", "stock_min")
    .order("stock_current", { ascending: true });

  if (error) throw error;

  return data;
}