import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/dashboard
// Returns: { todayRevenue, todayOrders, pendingOrders, lowStockCount, channelSummary }
export async function GET() {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);

    // Ambil semua orders hari ini
    const { data: todayOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today);

    if (ordersError) throw ordersError;

    const todayRevenue = todayOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingOrders = todayOrders.filter((o) => o.status === "pending").length;

    // Ambil produk stok menipis
    const { data: lowStock, error: stockError } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .lte("stock_current", "stock_min");

    if (stockError) throw stockError;

    // Rekapitulasi per kanal
    const channelSummary = (["pos", "sales", "web"] as const).map((source) => {
      const sourceOrders = todayOrders.filter((o) => o.order_source === source);
      const revenue = sourceOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total_amount, 0);
      return { source, count: sourceOrders.length, revenue };
    });

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue,
        todayOrders: todayOrders.length,
        pendingOrders,
        lowStockCount: lowStock.length,
        channelSummary,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}