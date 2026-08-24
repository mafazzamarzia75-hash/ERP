import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderStatusSchema } from "@/lib/validators/order";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/orders/[id]
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Pesanan tidak ditemukan" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`GET /api/orders/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pesanan" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id]
// Body: { status: "processed" | "shipped" | "completed" | "cancelled" }
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = orderStatusSchema.parse(body);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: parsed.status })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error(`PATCH /api/orders/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal update status pesanan" },
      { status: 500 }
    );
  }
}