import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/stock-movements
// Query params: ?product_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    const supabase = createClient();
    let query = supabase
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (productId) query = query.eq("product_id", productId);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/stock-movements error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat mutasi stok" },
      { status: 500 }
    );
  }
}