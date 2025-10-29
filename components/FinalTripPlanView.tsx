import React from "react";
import { Download, MapPin, Clock, Users, DollarSign, Car, Utensils, Bed, Camera, Calendar, CheckCircle } from "lucide-react";

export type Plan = {
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
  itinerary: Array<{
    day: string;
    label: string;
    items: Array<{
      time: string;
      name: string;
      type: string;
      location?: string;
      estCost?: number;
      duration?: string;
    }>;
  }>;
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

function getActivityIcon(type: string) {
  switch (type) {
    case "travel": return <Car className="w-5 h-5" />;
    case "meal": return <Utensils className="w-5 h-5" />;
    case "attraction": return <Camera className="w-5 h-5" />;
    case "checkin":
    case "checkout": return <Bed className="w-5 h-5" />;
    case "shopping": return <MapPin className="w-5 h-5" />;
    default: return <Clock className="w-5 h-5" />;
  }
}
function getActivityColor(type: string) {
  switch (type) {
    case "travel": return "bg-blue-100 text-blue-700";
    case "meal": return "bg-orange-100 text-orange-700";
    case "attraction": return "bg-green-100 text-green-700";
    case "checkin":
    case "checkout": return "bg-purple-100 text-purple-700";
    case "shopping": return "bg-pink-100 text-pink-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function FinalTripPlanView({
  plan,
  onDownload,
  downloading = false,
}: {
  plan: Plan;
  onDownload?: () => void;
  downloading?: boolean;
}) {

  const totalPerPerson = plan.itinerary.reduce(
    (sum, d) => sum + d.items.reduce((s, it) => s + (it.estCost || 0), 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{plan.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{plan.dates || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{plan.participants ?? "-"} คน</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>{totalPerPerson.toLocaleString()} บาท/คน</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-1" />
            <p className="text-xs md:text-sm text-green-600 font-medium">แผนเสร็จสิ้น</p>
          </div>
        </div>

        {/* Overview boxes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-700 mb-2">สถานที่ท่องเที่ยว</h3>
            <ul className="text-sm text-purple-600 space-y-1">
              {plan.overview.destinations.map((d, i) => <li key={i}>• {d}</li>)}
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">ที่พัก</h3>
            <p className="text-sm text-blue-600">{plan.overview.accommodation || "-"}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700 mb-2">การเดินทาง</h3>
            <p className="text-sm text-green-600">{plan.overview.transportation || "-"}</p>
            <p className="text-xs text-green-500">รวม {plan.overview.totalDistance || "-"}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-700 mb-2">งบประมาณรวม</h3>
            <p className="text-xl font-bold text-orange-600">{(plan.totalBudget ?? 0).toLocaleString()}</p>
            <p className="text-xs text-orange-500">บาท (ประมาณ)</p>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="p-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">กำหนดการเดินทาง</h2>
        {plan.itinerary.map((day, idx) => (
          <div key={idx} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800">{day.label}</h3>
              <span className="text-gray-500">({day.day})</span>
            </div>
            <div className="ml-4 border-l-2 border-purple-200 pl-6 space-y-4">
              {day.items.map((it, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-9 w-4 h-4 bg-purple-400 rounded-full border-2 border-white"></div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getActivityColor(it.type)}`}>
                          {getActivityIcon(it.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{it.name}</h4>
                          <p className="text-sm text-gray-600">{it.location || ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{it.time}</div>
                        <div className="text-sm text-gray-500">{it.duration || ""}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span></span>
                      {it.estCost && it.estCost > 0 && (
                        <span className="font-medium text-green-600">฿{it.estCost.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Budget & Tips */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">สรุปค่าใช้จ่าย</h3>
            <div className="space-y-3">
              {Object.entries(plan.budgetBreakdown).map(([k, v]) => {
                const labels: Record<string, string> = {
                  transportation: "การเดินทาง",
                  accommodation: "ที่พัก",
                  attractions: "สถานที่ท่องเที่ยว",
                  meals: "อาหาร",
                  shopping: "ช็อปปิ้ง",
                  miscellaneous: "เบ็ดเตล็ด",
                };
                return (
                  <div key={k} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{labels[k]}</span>
                    <span className="font-semibold text-gray-800">฿{v.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">เคล็ดลับการเดินทาง</h3>
            <div className="space-y-2">
              {plan.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 mt-0.5">💡</span>
                  <span className="text-sm text-yellow-800">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download button (optional) */}
        {onDownload && (
          <div className="text-center border-t border-gray-200 pt-6 mt-8">
            <button
              onClick={onDownload}
              disabled={downloading}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition ${
                downloading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
              }`}
            >
              {downloading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>ดาวน์โหลดแผนการเดินทาง (PDF)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
