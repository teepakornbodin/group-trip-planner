import { NextResponse } from "next/server";

// type ParticipantData
export interface ParticipantData {
  id?: string;
  nickname: string;
  available_dates: string[];
  budget: number;
  preferred_province: string;
  travel_styles: string[];
  additional_notes?: string;
}

export async function POST(req: Request) {
  const body = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  // สร้าง payload สำหรับ Gemini
  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              "คุณคือผู้ช่วยท่องเที่ยว ช่วยสรุปและวางแผนการเดินทางจากข้อมูลนี้ให้อ่านง่ายๆ และตอบเป็นข้อความธรรมดา\n\n"
          },
          {
            text: JSON.stringify({
              trip: body.trip,
              participants: body.participants
            })
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    console.log("Gemini response full:", JSON.stringify(data, null, 2));

    // ดึงข้อความจาก response
    let text = "ไม่มีข้อมูลตอบกลับ";
    if (data?.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      const parts = candidate?.content?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        text = parts.map((p: any) => p.text).join("\n");
      }
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "Failed to call Gemini API" }, { status: 500 });
  }
}
