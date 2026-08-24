import { createClient } from "@/lib/supabase/server";

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  channelSummary: {
    source: "pos" | "sales" | "web";
    count: number;
    revenue: number;
  }[];
}

/**
 * Mengagregasi data untuk dashboard eksekutif.
 * - Omset hari ini
 * - Jumlah pesanan hari ini
 * - Pesanan pending
 * - Produk stok menipis
 * - Rekapitulasi per kanal (pos, sales, web)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  // ===== AMBIL ORDERS HARI INI =====
  const { data: todayOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", today);

  if (ordersError) throw ordersError;

  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = todayOrders.filter((o) => o.status === "pending").length;

  // ===== AMBIL PRODUK STOK MENIPIS =====
  const { data: lowStock, error: stockError } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true)
    .lte("stock_current", "stock_min");

  if (stockError) throw stockError;

  // ===== REKAPITULASI PER KANAL =====
  const channelSummary = (["pos", "sales", "web"] as const).map((source) => {
    const sourceOrders = todayOrders.filter((o) => o.order_source === source);
    const revenue = sourceOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_amount, 0);
    return { source, count: sourceOrders.length, revenue };
  });

  return {
    todayRevenue,
    todayOrders: todayOrders.length,
    pendingOrders,
    lowStockCount: lowStock.length,
    channelSummary,
  };
}