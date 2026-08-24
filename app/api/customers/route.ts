import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validators/customer";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/customers
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pelanggan" },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = customerSchema.parse(body);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
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
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah pelanggan" },
      { status: 500 }
    );
  }
}