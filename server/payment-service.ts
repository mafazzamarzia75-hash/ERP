import type { PaymentType } from "@/types";

interface PaymentCalculationInput {
  totalAmount: number;
  paymentType: PaymentType;
  cashTendered?: number;
}

interface PaymentCalculationResult {
  cashTendered: number;
  cashChange: number;
  isPaid: boolean;
}

/**
 * Menghitung pembayaran dan kembalian.
 * - Cash: cashTendered harus >= totalAmount, kembalian dihitung
 * - Tempo: tidak ada pembayaran di muka, dicatat sebagai piutang
 */
export function calculatePayment(input: PaymentCalculationInput): PaymentCalculationResult {
  if (input.paymentType === "tempo") {
    return {
      cashTendered: 0,
      cashChange: 0,
      isPaid: false,
    };
  }

  const cashTendered = input.cashTendered ?? 0;
  const cashChange = cashTendered - input.totalAmount;

  return {
    cashTendered,
    cashChange: Math.max(cashChange, 0),
    isPaid: cashTendered >= input.totalAmount,
  };
}

/**
 * Memformat angka ke format Rupiah (IDR).
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}