"use client";
import React, { useState } from 'react';
import { Download, MapPin, Clock, Users, DollarSign, Car, Utensils, Bed, Camera, Calendar, CheckCircle } from 'lucide-react';

const FinalTripPlan = () => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Mock final trip plan data - in real app, this would come from AI processing
  const tripPlan = {
    title: "แผนการเดินทางเชียงใหม่ 3 วัน 2 คืน",
    dates: "17-19 มีนาคม 2567",
    participants: 3,
    totalBudget: 15000,
    overview: {
      destinations: ["วัดพระธาตุดอยสุเทพ", "ตลาดเจ้าพระยา", "คาเฟ่ดอยช้าง"],
      accommodation: "รีสอร์ท ดอยคำ",
      transportation: "รถเช่า",
      totalDistance: "120 กม."
    },
    itinerary: [
      {
        day: 1,
        date: "17 มีนาคม 2567",
        activities: [
          {
            time: "08:00",
            type: "travel",
            title: "เดินทางจากกรุงเทพ",
            description: "บินไปเชียงใหม่",
            duration: "1.5 ชั่วโมง",
            cost: 3000,
            icon: "✈️"
          },
          {
            time: "11:00",
            type: "checkin",
            title: "เช็คอินที่พัก",
            description: "รีสอร์ท ดอยคำ - พักผ่อนและเตรียมตัว",
            duration: "1 ชั่วโมง",
            cost: 2500,
            icon: "🏨"
          },
          {
            time: "13:00",
            type: "meal",
            title: "อาหารกลางวัน",
            description: "ร้านอาหารท้องถิ่น - ข้าวซอย",
            duration: "1 ชั่วโมง",
            cost: 300,
            icon: "🍜"
          },
          {
            time: "15:00",
            type: "attraction",
            title: "วัดพระธาตุดอยสุเทพ",
            description: "เที่ยวชมวัดและชมวิวเมืองเชียงใหม่",
            duration: "3 ชั่วโมง",
            cost: 50,
            icon: "🏛️"
          },
          {
            time: "19:00",
            type: "meal",
            title: "อาหารเย็น",
            description: "ตลาดเจ้าพระยา - อาหารข้างทาง",
            duration: "2 ชั่วโมง",
            cost: 400,
            icon: "🍽️"
          }
        ]
      },
      {
        day: 2,
        date: "18 มีนาคม 2567",
        activities: [
          {
            time: "08:00",
            type: "meal",
            title: "อาหารเช้า",
            description: "ที่รีสอร์ท - บุฟเฟ่ต์เช้า",
            duration: "1 ชั่วโมง",
            cost: 0,
            icon: "🥐"
          },
          {
            time: "10:00",
            type: "attraction",
            title: "คาเฟ่ดอยช้าง",
            description: "ดื่มกาแฟ ชมวิว ถ่ายรูป",
            duration: "2 ชั่วโมง",
            cost: 600,
            icon: "☕"
          },
          {
            time: "13:00",
            type: "meal",
            title: "อาหารกลางวัน",
            description: "ร้านอาหารบนดอย",
            duration: "1 ชั่วโมง",
            cost: 450,
            icon: "🍛"
          },
          {
            time: "15:00",
            type: "shopping",
            title: "ตลาดเจ้าพระยา",
            description: "ช็อปปิ้งของฝาก ของที่ระลึก",
            duration: "3 ชั่วโมง",
            cost: 1500,
            icon: "🛍️"
          },
          {
            time: "19:00",
            type: "meal",
            title: "อาหารเย็น",
            description: "ร้านอาหารในตลาด",
            duration: "1.5 ชั่วโมง",
            cost: 350,
            icon: "🥘"
          }
        ]
      },
      {
        day: 3,
        date: "19 มีนาคม 2567",
        activities: [
          {
            time: "08:00",
            type: "meal",
            title: "อาหารเช้า",
            description: "ที่รีสอร์ท - บุฟเฟ่ต์เช้า",
            duration: "1 ชั่วโมง",
            cost: 0,
            icon: "🥐"
          },
          {
            time: "10:00",
            type: "checkout",
            title: "เช็คเอาท์",
            description: "เก็บของและเช็คเอาท์จากรีสอร์ท",
            duration: "30 นาที",
            cost: 0,
            icon: "🧳"
          },
          {
            time: "11:00",
            type: "attraction",
            title: "แหล่งช็อปปิ้งสุดท้าย",
            description: "ซื้อของฝากก่อนเดินทางกลับ",
            duration: "2 ชั่วโมง",
            cost: 800,
            icon: "🎁"
          },
          {
            time: "14:00",
            type: "meal",
            title: "อาหารกลางวัน",
            description: "ร้านอาหารใกล้สนามบิน",
            duration: "1 ชั่วโมง",
            cost: 300,
            icon: "🍚"
          },
          {
            time: "16:00",
            type: "travel",
            title: "เดินทางกลับ",
            description: "บินกลับกรุงเทพ",
            duration: "1.5 ชั่วโมง",
            cost: 3000,
            icon: "✈️"
          }
        ]
      }
    ],
    budgetBreakdown: {
      accommodation: 2500,
      transportation: 6000,
      meals: 1800,
      attractions: 650,
      shopping: 2300,
      miscellaneous: 1750
    },
    tips: [
      "จองตั๋วเครื่องบินล่วงหน้าเพื่อราคาดี",
      "เตรียมเสื้อแจ็คเก็ตสำหรับอากาศเย็นบนดอย",
      "เช็คสภาพอากาศก่อนเดินทาง",
      "เตรียมเงินสดสำหรับตลาดท้องถิ่น",
      "ดาวน์โหลดแอปแปลภาษาไว้ใช้กับชาวบ้าน"
    ]
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'travel': return <Car className="w-5 h-5" />;
      case 'meal': return <Utensils className="w-5 h-5" />;
      case 'attraction': return <Camera className="w-5 h-5" />;
      case 'checkin': case 'checkout': return <Bed className="w-5 h-5" />;
      case 'shopping': return <MapPin className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'travel': return 'bg-blue-100 text-blue-700';
      case 'meal': return 'bg-orange-100 text-orange-700';
      case 'attraction': return 'bg-green-100 text-green-700';
      case 'checkin': case 'checkout': return 'bg-purple-100 text-purple-700';
      case 'shopping': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    // Simulate PDF generation and download
    setTimeout(() => {
      // In real app, this would:
      // 1. Generate PDF with trip details
      // 2. Download the file
      // 3. Delete trip data from database
      alert('แผนการเดินทางถูกดาวน์โหลดเรียบร้อยแล้ว!\n\n' +
            'ข้อมูลการวางแผนทริปนี้จะถูกลบออกจากระบบเพื่อความเป็นส่วนตัว\n' +
            'หากต้องการแผนการเดินทาง กรุณาเก็บไฟล์ PDF ไว้ให้ดี');
      setDownloadingPDF(false);
    }, 2000);
  };

  const totalCost = tripPlan.itinerary.reduce((total, day) => 
    total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100  rounded-t-2xl">
      {/* Navigation */}


      <main className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 rounded-t-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{tripPlan.title}</h1>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{tripPlan.dates}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{tripPlan.participants} คน</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>{totalCost.toLocaleString()} บาท/คน</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">แผนเสร็จสิ้น</p>
            </div>
          </div>

          {/* Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-2">สถานที่ท่องเที่ยว</h3>
              <ul className="text-sm text-purple-600 space-y-1">
                {tripPlan.overview.destinations.map((dest, i) => (
                  <li key={i}>• {dest}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">ที่พัก</h3>
              <p className="text-sm text-blue-600">{tripPlan.overview.accommodation}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">การเดินทาง</h3>
              <p className="text-sm text-green-600">{tripPlan.overview.transportation}</p>
              <p className="text-xs text-green-500">รวม {tripPlan.overview.totalDistance}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-700 mb-2">งบประมาณรวม</h3>
              <p className="text-xl font-bold text-orange-600">{totalCost.toLocaleString()}</p>
              <p className="text-xs text-orange-500">บาท/คน</p>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-white shadow-xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">กำหนดการเดินทาง</h2>
            
            {tripPlan.itinerary.map((day) => (
              <div key={day.day} className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">วันที่ {day.day}</h3>
                  <span className="text-gray-500">({day.date})</span>
                </div>
                
                <div className="ml-4 border-l-2 border-purple-200 pl-6 space-y-4">
                  {day.activities.map((activity, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-9 w-4 h-4 bg-purple-400 rounded-full border-2 border-white"></div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">{activity.time}</div>
                            <div className="text-sm text-gray-500">{activity.duration}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-2xl">{activity.icon}</span>
                          {activity.cost > 0 && (
                            <span className="font-medium text-green-600">
                              ฿{activity.cost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Breakdown & Tips */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Budget Breakdown */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">สรุปค่าใช้จ่าย</h3>
              <div className="space-y-3">
                {Object.entries(tripPlan.budgetBreakdown).map(([category, amount]) => {
                  const categoryLabels = {
                    accommodation: 'ที่พัก',
                    transportation: 'การเดินทาง',
                    meals: 'อาหาร',
                    attractions: 'สถานที่ท่องเที่ยว',
                    shopping: 'ช็อปปิ้ง',
                    miscellaneous: 'เบ็ดเตล็ด'
                  };
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{categoryLabels[category]}</span>
                      <span className="font-semibold text-gray-800">฿{amount.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-bold text-purple-700">รวมทั้งสิ้น</span>
                    <span className="font-bold text-xl text-purple-700">฿{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">เคล็ดลับการเดินทาง</h3>
              <div className="space-y-2">
                {tripPlan.tips.map((tip, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-600 mt-0.5">💡</span>
                    <span className="text-sm text-yellow-800">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center border-t border-gray-200 pt-6">
            <p className="text-gray-600 mb-4">
              ดาวน์โหลดแผนการเดินทางเพื่อเก็บไว้ใช้งาน
            </p>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className={`inline-flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                downloadingPDF
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg'
              }`}
            >
              {downloadingPDF ? (
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
            
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-1">⚠️ หลังจากดาวน์โหลดแล้ว ข้อมูลการวางแผนนี้จะถูกลบออกจากระบบ</p>
              <p>เพื่อปกป้องความเป็นส่วนตัวของคุณและเพื่อน</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinalTripPlan;