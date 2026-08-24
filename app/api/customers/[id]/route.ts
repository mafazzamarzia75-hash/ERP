import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { customerUpdateSchema } from "@/lib/validators/customer";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/customers/[id]
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Pelanggan tidak ditemukan" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`GET /api/customers/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pelanggan" },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id]
// Body: { name?, phone?, email?, address?, lat?, lng?, credit_limit? }
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = customerUpdateSchema.parse(body);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
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
    console.error(`PATCH /api/customers/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal update pelanggan" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/customers/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Gagal hapus pelanggan" },
      { status: 500 }
    );
  }
}