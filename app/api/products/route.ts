import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validators/product";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/products
// Query params: ?active=true&search=keyword
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const search = searchParams.get("search");

    const supabase = createClient();
    let query = supabase.from("products").select("*");

    if (active === "true") query = query.eq("is_active", true);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query.order("name");

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}

// POST /api/products
// Body: { name, sku, price_buy, price_sell, stock_current, stock_min }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = productSchema.parse(body);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .insert(parsed)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah produk" },
      { status: 500 }
    );
  }
}