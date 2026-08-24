import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validators/order";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/orders
// Query params: ?source=pos&status=pending
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const status = searchParams.get("status");

    const supabase = createClient();
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (source) query = query.eq("order_source", source);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pesanan" },
      { status: 500 }
    );
  }
}

// POST /api/orders
// Body: { order_source, payment_type, cash_tendered, items: [{ product_id, quantity }] }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.parse(body);

    const supabase = createClient();

    // Validasi: Kanal web WAJIB cash (lunas)
    if (parsed.order_source === "web" && parsed.payment_type !== "cash") {
      return NextResponse.json(
        { success: false, error: "Kanal web hanya mendukung pembayaran lunas (cash)" },
        { status: 400 }
      );
    }

    // Hitung total dari items
    const productIds = parsed.items.map((item) => item.product_id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, price_sell, stock_current")
      .in("id", productIds);

    if (productError) throw productError;

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;

    for (const item of parsed.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Produk ${item.product_id} tidak ditemukan` },
          { status: 400 }
        );
      }
      if (product.stock_current < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Stok ${product.id} tidak mencukupi` },
          { status: 400 }
        );
      }
      totalAmount += product.price_sell * item.quantity;
    }

    // Insert order header
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: parsed.customer_id ?? null,
        salesman_id: parsed.salesman_id ?? null,
        order_source: parsed.order_source,
        payment_type: parsed.payment_type,
        total_amount: totalAmount,
        cash_tendered: parsed.cash_tendered ?? 0,
        cash_change: parsed.payment_type === "cash"
          ? (parsed.cash_tendered ?? 0) - totalAmount
          : 0,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = parsed.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_transaction: productMap.get(item.product_id)!.price_sell,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}