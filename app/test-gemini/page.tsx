"use client";

import { useState } from "react";

export default function TestGeminiPage() {
  const [result, setResult] = useState("");

  const handleTest = async () => {
    // ข้อมูลตัวอย่าง trip + participants
    const tripData = {
      trip: {
        destination: "เชียงใหม่",
        duration: "3 วัน 2 คืน",
        date: "17-19 มีนาคม 2567",
        budget_per_person: 13250
      },
      participants: [
        {
          id: "1",
          nickname: "Teepakorn",
          available_dates: ["2025-10-15", "2025-10-16", "2025-10-17"],
          budget: 15000,
          preferred_province: "เชียงใหม่",
          travel_styles: ["พักผ่อน", "ช็อปปิ้ง", "คาเฟ่"],
          additional_notes: "ชอบวิวธรรมชาติ"
        },
        {
          id: "2",
          nickname: "Somchai",
          available_dates: ["2025-10-16", "2025-10-17", "2025-10-18"],
          budget: 12000,
          preferred_province: "เชียงใหม่",
          travel_styles: ["ผจญภัย", "เที่ยววัด"]
        }
      ]
    };

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripData)
    });

    const data = await res.json();
    setResult(data.text ?? "ไม่มีข้อมูลตอบกลับ");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ทดสอบ Gemini API</h1>
      <button
        onClick={handleTest}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        เรียก Gemini API
      </button>

      {result && (
        <pre className="mt-4 whitespace-pre-wrap bg-gray-100 p-4 rounded">
          {result}
        </pre>
      )}
    </div>
  );
}
