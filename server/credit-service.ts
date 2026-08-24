import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

interface CreditValidationInput {
  customerId: string;
  orderAmount: number;
}

interface CreditValidationResult {
  allowed: boolean;
  currentOutstanding: number;
  creditLimit: number;
  remainingLimit: number;
  message: string;
}

/**
 * Memvalidasi apakah pelanggan masih memiliki sisa plafon utang (tempo).
 * - Menghitung total piutang aktif (status pending/processed/shipped)
 * - Membandingkan dengan credit_limit pelanggan
 */
export async function validateCreditLimit(
  input: CreditValidationInput
): Promise<CreditValidationResult> {
  const supabase = createClient();

  // ===== AMBIL DATA PELANGGAN =====
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name, credit_limit")
    .eq("id", input.customerId)
    .single();

  if (customerError) throw new Error("Pelanggan tidak ditemukan");

  // ===== HITUNG PIUTANG AKTIF =====
  const { data: activeOrders, error: ordersError } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("customer_id", input.customerId)
    .eq("payment_type", "tempo")
    .in("status", ["pending", "processed", "shipped"]);

  if (ordersError) throw ordersError;

  const currentOutstanding = activeOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  const creditLimit = customer.credit_limit;
  const remainingLimit = creditLimit - currentOutstanding;
  const allowed = remainingLimit >= input.orderAmount;

  return {
    allowed,
    currentOutstanding,
    creditLimit,
    remainingLimit,
    message: allowed
      ? `Sisa plafon: ${formatRupiah(remainingLimit)}`
      : `Plafon tidak mencukupi. Sisa: ${formatRupiah(remainingLimit)}`,
  };
}