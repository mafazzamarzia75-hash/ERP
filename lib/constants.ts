// =============================================
// APP CONSTANTS
// =============================================

export const APP_NAME = "Sanvinal Mini-ERP";

export const APP_DESCRIPTION =
  "Sistem Mini-ERP berbasis web yang mengintegrasikan etalase publik, POS toko fisik, tenaga sales lapangan, gudang, dan dasbor manajer.";

export const ORDER_STATUSES = [
  "pending",
  "processed",
  "shipped",
  "completed",
  "cancelled",
] as const;

export const ORDER_SOURCES = ["pos", "sales", "web"] as const;

export const PAYMENT_TYPES = ["cash", "tempo"] as const;

export const STOCK_REASONS = ["sale", "restock", "adjustment", "return"] as const;

export const ROLES = ["manager", "salesman", "warehouse", "cashier"] as const;

export const STORE_INFO = {
  name: "SANVINAL STORE",
  address: "Jl. Contoh No. 123, Jakarta",
  phone: "021-1234-5678",
} as const;