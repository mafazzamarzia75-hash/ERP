import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productUpdateSchema } from "@/lib/validators/product";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/products/[id]
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Produk tidak ditemukan" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`GET /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = productUpdateSchema.parse(body);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .update(parsed)
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
    console.error(`PATCH /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal update produk" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal hapus produk" },
      { status: 500 }
    );
  }
}