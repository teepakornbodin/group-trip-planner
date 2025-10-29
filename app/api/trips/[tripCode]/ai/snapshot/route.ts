// app/api/trips/[tripCode]/ai/snapshot/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Params = { params: Promise<{ tripCode: string }> };

export async function POST(_req: Request, ctx: Params) {
  try {
    const { tripCode } = await ctx.params;

    // ใช้ service-role บน server เพื่อไม่ติด RLS (หรือใช้ security definer ที่ DB แทนก็ได้)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // ❗️อย่าใส่ "public." ในชื่อฟังก์ชันอีก
    const { data, error, status } = await supabase
      .schema("public")
      .rpc("create_ai_snapshot", { p_trip_code: tripCode });

    if (error) {
      console.error("[snapshot rpc error]", { status, error });
      return NextResponse.json(
        { success: false, error: error.message, details: (error as any).details, code: (error as any).code },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      console.error("[snapshot rpc empty]", { data });
      return NextResponse.json(
        { success: false, error: "Snapshot function returned no rows" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      snapshot_id: row.snapshot_id,
      created_at: row.created_at,
      payload: row.payload,
    });
  } catch (err: any) {
    console.error("[snapshot route fatal]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
