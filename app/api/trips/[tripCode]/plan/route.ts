// app/api/trips/[tripCode]/plan/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Params = { params: Promise<{ tripCode: string }> };

const SYSTEM_INSTRUCTION = `
You are a professional Thai travel planner AI. You must respond ONLY with valid JSON matching this exact TypeScript type:

type Plan = {
  title: string;
  dates: string | null;
  participants: number | null;
  totalBudget: number | null;
  overview: { 
    destinations: string[];
    accommodation?: string;
    transportation?: string;
    totalDistance?: string;
  };
  itinerary: {
    day: string;
    label: string;
    items: {
      time: string;
      name: string;
      type: "travel" | "meal" | "attraction" | "checkin" | "checkout" | "shopping";
      location?: string;
      estCost?: number;
      duration?: string;
    }[]
  }[];
  budgetBreakdown: {
    transportation: number;
    accommodation: number;
    attractions: number;
    meals: number;
    shopping: number;
    miscellaneous: number;
  };
  tips: string[];
};

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All text in Thai language
- Create realistic, detailed itinerary based on the snapshot data
- Prioritize top-voted places in the itinerary
- Budget should match constraints (max budget per person × group size)
`;

// เพิ่ม GET endpoint สำหรับดึง Plan ที่มีอยู่แล้ว
export async function GET(_req: Request, ctx: Params) {
  try {
    const { tripCode } = await ctx.params;

    // หา trip_id จาก trip_code
    const { data: tripData, error: tripErr } = await supabase
      .from("trips")
      .select("id")
      .eq("trip_code", tripCode)
      .single();

    if (tripErr || !tripData) {
      return NextResponse.json(
        { success: false, error: "ไม่พบทริปนี้" },
        { status: 404 }
      );
    }

    // ดึง plan ล่าสุดของทริปนี้
    const { data: planData, error: planErr } = await supabase
      .from("trip_plans")
      .select("*")
      .eq("trip_id", tripData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (planErr || !planData) {
      return NextResponse.json(
        { success: false, error: "ยังไม่มีแผนการเดินทาง", exists: false },
        { status: 404 }
      );
    }

    // แปลงข้อมูลจาก DB เป็น format ที่ frontend ต้องการ
    const plan = {
      title: planData.plan_title,
      dates: planData.dates || null,
      participants: planData.participants || null,
      totalBudget: planData.total_budget,
      overview: planData.overview || {},
      itinerary: planData.itinerary || [],
      budgetBreakdown: planData.budget_breakdown || {},
      tips: planData.travel_tips || [],
    };

    return NextResponse.json({
      success: true,
      exists: true,
      data: plan,
      createdAt: planData.created_at,
    });
  } catch (err: any) {
    console.error("Get plan error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(_req: Request, ctx: Params) {
  try {
    const { tripCode } = await ctx.params;
    const body = await _req.json().catch(() => ({}));
    const forceNew = body?.forceNew === true; // เพิ่ม option สำหรับบังคับสร้างใหม่

    // หา trip_id จาก trip_code
    const { data: tripData, error: tripErr } = await supabase
      .from("trips")
      .select("id")
      .eq("trip_code", tripCode)
      .single();

    if (tripErr || !tripData) {
      return NextResponse.json(
        { success: false, error: "ไม่พบทริปนี้" },
        { status: 404 }
      );
    }

    //  เช็คว่ามี Plan เก่าอยู่แล้วหรือไม่ (ถ้าไม่ได้บังคับสร้างใหม่)
    if (!forceNew) {
      const { data: existingPlan } = await supabase
        .from("trip_plans")
        .select("*")
        .eq("trip_id", tripData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingPlan) {
        // มี Plan เก่าอยู่แล้ว ส่งกลับไปเลย
        const plan = {
          title: existingPlan.plan_title,
          dates: existingPlan.dates || null,
          participants: existingPlan.participants || null,
          totalBudget: existingPlan.total_budget,
          overview: existingPlan.overview || {},
          itinerary: existingPlan.itinerary || [],
          budgetBreakdown: existingPlan.budget_breakdown || {},
          tips: existingPlan.travel_tips || [],
        };

        return NextResponse.json({
          success: true,
          data: plan,
          fromCache: true,
          createdAt: existingPlan.created_at,
        });
      }
    }

    // 1) ดึง snapshot ล่าสุดของ trip นี้
    const { data: rows, error: qerr } = await supabase
      .from("ai_input_snapshots")
      .select("id, created_at, payload")
      .eq("trip_code", tripCode)
      .order("created_at", { ascending: false })
      .limit(1);

    if (qerr) throw qerr;
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่มี snapshot กรุณากดสร้าง snapshot ก่อน" },
        { status: 400 }
      );
    }
    const snapshot = rows[0];
    const payload = snapshot.payload as any;

    // 2) เรียก Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set. Returning mock plan.");
      const mockPlan = mockPlanFromSnapshot(payload);
      
      // บันทึก mock plan ลง DB
      await savePlanToDatabase(tripData.id, mockPlan, "mock");
      
      return NextResponse.json({
        success: true,
        data: mockPlan,
        fromCache: false,
        meta: { note: "GEMINI_API_KEY not set. Returned mock plan." },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const userPrompt = `
สร้างแผนการท่องเที่ยวแบบละเอียดจากข้อมูล snapshot ต่อไปนี้:

ข้อมูลกลุ่ม:
- จำนวนคน: ${payload?.constraints?.group_size ?? "ไม่ระบุ"} คน
- งบประมาณต่อคน (ขั้นต่ำ): ${payload?.constraints?.max_budget_per_person ?? "ไม่ระบุ"} บาท
- สไตล์การเที่ยว: ${JSON.stringify(payload?.constraints?.travel_styles ?? [])}
- จังหวัดที่นิยม: ${JSON.stringify(payload?.constraints?.preferred_provinces ?? [])}
- ช่วงวันที่เป็นไปได้: ${JSON.stringify(payload?.constraints?.date_window?.all_dates ?? [])}

สถานที่ที่ได้คะแนนโหวตสูงสุด (จัดตามลำดับ):
${JSON.stringify(payload?.votes_summary ?? [], null, 2)}

ข้อกำหนด:
1. สร้างแผนที่สมเหตุสมผลตามข้อมูลที่ให้มา
2. ใช้สถานที่ที่ได้คะแนนโหวตสูงเป็นหลัก
3. ระบุเวลา ระยะเวลา และค่าใช้จ่ายโดยประมาณ
4. งบประมาณรวมต้องไม่เกิน ${payload?.constraints?.max_budget_per_person ?? 10000} × ${payload?.constraints?.group_size ?? 2} บาท
5. กิจกรรมต้องเรียงลำดับที่สมเหตุสมผล
6. ตอบกลับเป็น JSON object เท่านั้น ห้ามมีข้อความอธิบายเพิ่มเติม

SNAPSHOT DATA:
${JSON.stringify(payload, null, 2)}
`;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text().trim();

    // 3) พยายาม parse JSON ที่ Gemini ส่งมา
    let planJson: any = null;
    try {
      let cleaned = text;
      if (text.includes("```")) {
        cleaned = text
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
      }
      planJson = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse LLM response:", text);
      const mockPlan = mockPlanFromSnapshot(payload);
      
      // บันทึก mock plan ลง DB
      await savePlanToDatabase(tripData.id, mockPlan, "mock-fallback");
      
      return NextResponse.json({
        success: true,
        data: mockPlan,
        fromCache: false,
        meta: {
          note: "LLM JSON parse failed. Returned mock plan.",
          raw: text.substring(0, 500),
        },
      });
    }

    // 4) บันทึกลงตาราง trip_plans
    await savePlanToDatabase(tripData.id, planJson, "gemini");

    return NextResponse.json({
      success: true,
      data: planJson,
      fromCache: false,
    });
  } catch (err: any) {
    console.error("Plan generation error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// Helper function สำหรับบันทึก Plan
async function savePlanToDatabase(tripId: number, planData: any, generatedBy: string) {
  try {
    await supabase
      .from("trip_plans")
      .insert({
        trip_id: tripId,
        plan_title: planData?.title ?? "แผนการเดินทาง",
        dates: planData?.dates ?? null,
        participants: planData?.participants ?? null,
        itinerary: planData?.itinerary ?? [],
        overview: planData?.overview ?? {},
        budget_breakdown: planData?.budgetBreakdown ?? {},
        travel_tips: planData?.tips ?? [],
        total_budget: planData?.totalBudget ?? null,
        generated_by: generatedBy,
      })
      .select()
      .single();
  } catch (insertErr) {
    console.warn("Failed to save plan to DB:", insertErr);
  }
}

function mockPlanFromSnapshot(payload: any) {
  const group = payload?.constraints?.group_size ?? 2;
  const maxBudget = payload?.constraints?.max_budget_per_person ?? 10000;
  const dates = payload?.constraints?.date_window?.all_dates ?? [];
  const topPlaces = (payload?.votes_summary ?? []).slice(0, 3);
  const topNames = topPlaces.map((v: any) => v.name || "สถานที่ท่องเที่ยว");

  const totalBudget = group * maxBudget;

  return {
    title: `แผนการเดินทาง ${topNames[0] || "ท่องเที่ยวไทย"}`,
    dates: dates.length >= 2 ? `${dates[0]} ถึง ${dates[dates.length - 1]}` : null,
    participants: group,
    totalBudget: totalBudget,
    overview: {
      destinations: topNames,
      accommodation: "โรงแรม/รีสอร์ทใกล้จุดท่องเที่ยว",
      transportation: "รถเช่า / รถตู้",
      totalDistance: "≈ 150 กม.",
    },
    itinerary: [
      {
        day: dates[0] || "2025-11-01",
        label: "วันที่ 1",
        items: [
          {
            time: "09:00",
            name: topNames[0] || "สถานที่ท่องเที่ยว A",
            type: "attraction" as const,
            location: topPlaces[0]?.location || "ไม่ระบุ",
            estCost: Math.round((topPlaces[0]?.estimated_cost || 200) * group),
            duration: topPlaces[0]?.duration || "2 ชั่วโมง",
          },
          {
            time: "12:00",
            name: "อาหารกลางวัน - ร้านอาหารท้องถิ่น",
            type: "meal" as const,
            estCost: 150 * group,
            duration: "1 ชั่วโมง",
          },
          {
            time: "14:00",
            name: topNames[1] || "สถานที่ท่องเที่ยว B",
            type: "attraction" as const,
            location: topPlaces[1]?.location || "ไม่ระบุ",
            estCost: Math.round((topPlaces[1]?.estimated_cost || 150) * group),
            duration: topPlaces[1]?.duration || "2 ชั่วโมง",
          },
          {
            time: "18:00",
            name: "เช็คอินที่พัก",
            type: "checkin" as const,
            estCost: 0,
            duration: "30 นาที",
          },
          {
            time: "19:00",
            name: "อาหารเย็น - ร้านอาหารริมน้ำ",
            type: "meal" as const,
            estCost: 200 * group,
            duration: "1.5 ชั่วโมง",
          },
        ],
      },
      {
        day: dates[1] || "2025-11-02",
        label: "วันที่ 2",
        items: [
          {
            time: "08:00",
            name: "อาหารเช้าที่โรงแรม",
            type: "meal" as const,
            estCost: 0,
            duration: "1 ชั่วโมง",
          },
          {
            time: "10:00",
            name: "เช็คเอาท์",
            type: "checkout" as const,
            estCost: 0,
            duration: "30 นาที",
          },
          {
            time: "11:00",
            name: topNames[2] || "สถานที่ท่องเที่ยว C",
            type: "attraction" as const,
            location: topPlaces[2]?.location || "ไม่ระบุ",
            estCost: Math.round((topPlaces[2]?.estimated_cost || 100) * group),
            duration: topPlaces[2]?.duration || "2 ชั่วโมง",
          },
          {
            time: "14:00",
            name: "เดินทางกลับ",
            type: "travel" as const,
            estCost: 0,
            duration: "3 ชั่วโมง",
          },
        ],
      },
    ],
    budgetBreakdown: {
      transportation: Math.round(totalBudget * 0.25),
      accommodation: Math.round(totalBudget * 0.30),
      attractions: Math.round(totalBudget * 0.20),
      meals: Math.round(totalBudget * 0.15),
      shopping: Math.round(totalBudget * 0.05),
      miscellaneous: Math.round(totalBudget * 0.05),
    },
    tips: [
      "เตรียมเงินสดสำหรับจ่ายค่าบริการเล็กน้อย",
      "ควรเผื่อเวลาเดินทางระหว่างจุดหมายประมาณ 20-30%",
      "ตรวจสอบสภาพอากาศก่อนออกเดินทาง",
      `งบประมาณรวม ${totalBudget.toLocaleString()} บาท สำหรับ ${group} คน`,
    ],
  };
}