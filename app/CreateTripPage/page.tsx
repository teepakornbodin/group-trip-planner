//D:\group-trip-planner\app\CreateTripPage\page.tsx
"use client";
import React, { useState } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Compass,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/hooks/useTrip"; // 👈 import hook
import { QRCodeCanvas } from "qrcode.react"; // 👈 เพิ่มบรรทัดนี้

const CreateTripPage = () => {
  const router = useRouter();
  const { trip, loading, error, createTrip } = useTrip();
  const [copied, setCopied] = useState(false);

  const handleCreateTrip = async () => {
    try {
      const result = await createTrip();
      if (result?.success) {
        console.log("Trip created:", result.trip);
      }
    } catch (err) {
      console.error("Error creating trip:", err);
    }
  };

  const copyToClipboard = () => {
    if (!trip?.link) return;
    navigator.clipboard.writeText(trip.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // กรณีโหลดเสร็จแล้วและมี trip
  if (trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Trip Created Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              Share this link with your friends so they can join your trip
              planning
            </p>

            {/* Link Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Link</p>
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border overflow-hidden text-ellipsis">
                <span className="text-gray-800 flex-1 text-left overflow-hidden whitespace-nowrap text-ellipsis">
                  {trip.link}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 p-2 text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm text-gray-500 mb-2">Scan QR to Join</p>
              <div className="bg-white p-4 rounded-xl border">
                <QRCodeCanvas
                  value={trip.link}
                  size={180} // 👈 ขนาด QR
                  includeMargin={true}
                  className="max-w-full h-auto" // 👈 ทำให้ responsive
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={copyToClipboard}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => router.push(`/TripFormPage`)}
                className="border border-purple-500 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Form
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // หน้า default ก่อนสร้าง trip
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">สร้างทริปกลุ่มของคุณ</h1>
            <p className="text-purple-100">
              ตั้งค่าแผนทริปที่เพื่อน ๆ ของคุณสามารถเข้าร่วมและมีส่วนร่วมได้
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* ตัวอย่างข้อมูล */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                เกิดอะไรขึ้นเมื่อคุณสร้างทริป?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      รับลิงก์แชร์ทริป
                    </h3>
                    <p className="text-gray-600 text-sm">
                      คุณจะได้รับลิงก์เฉพาะสำหรับแชร์ให้เพื่อน ๆ เข้าร่วมทริป
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      เพื่อนกรอกความชอบ
                    </h3>
                    <p className="text-gray-600 text-sm">
                      แต่ละคนสามารถกรอกวันว่าง งบประมาณ และสไตล์การเดินทาง
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      AI แนะนำแผนที่เหมาะสม
                    </h3>
                    <p className="text-gray-600 text-sm">
                      AI จะวิเคราะห์ข้อมูลทุกคนเพื่อแนะนำสถานที่และกิจกรรม
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มสร้างทริป */}
            <button
              onClick={handleCreateTrip}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors"
            >
              {loading ? "กำลังสร้าง..." : "สร้างลิงก์ทริป"}
            </button>

            {error && (
              <p className="text-red-500 text-sm mt-4">เกิดข้อผิดพลาด: {error}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTripPage;
