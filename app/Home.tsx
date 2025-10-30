"use client";
import React from "react";
import { ArrowRight, Users, Vote, Bot } from "lucide-react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12 mb-12 lg:mb-20">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              วางแผนทริป
              <br />
              <span className="text-purple-600">แบบที่คุณต้องการ</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              วางแผนการเดินทางครั้งต่อไปกับเพื่อนๆ และให้ทุกคนมีส่วนร่วม! 
              แพลตฟอร์มของเราช่วยให้คุณแชร์ไอเดียการเดินทาง โหวตสถานที่ที่ชอบ 
              และปล่อยให้ AI ช่วยคุณเลือกแผนการเดินทางที่สมบูรณ์แบบ
            </p>

            {/* CTA Button - Desktop & Tablet */}
            <div className="hidden sm:flex justify-center lg:justify-start">
              <button
                onClick={() => router.push(`/CreateTripPage`)}
                className="inline-flex items-center space-x-3 bg-purple-500 hover:bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>เริ่มต้นเลย!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Robot Illustration */}
          <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md">
            <img
              src="/logo_GroupTripPlanner.png"
              alt="Group Trip Planner Illustration"
              className="w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* CTA Button - Mobile Only */}
        <div className="sm:hidden flex justify-center mb-12">
          <button
            onClick={() => router.push(`/CreateTripPage`)}
            className="w-full max-w-sm inline-flex items-center justify-center space-x-3 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg active:scale-95"
          >
            <span>เริ่มต้นเลย!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-12">
            ทำไมต้องเลือกเรา?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-3 text-center">
                วางแผนร่วมกัน
              </h3>
              <p className="text-gray-600 text-sm sm:text-base text-center leading-relaxed">
                ร่วมมือกับเพื่อนๆ เพื่อสร้างทริปที่สมบูรณ์แบบ 
                ทุกคนมีส่วนร่วมในการตัดสินใจ
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <Vote className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-3 text-center">
                โหวตและตัดสินใจ
              </h3>
              <p className="text-gray-600 text-sm sm:text-base text-center leading-relaxed">
                ให้ทุกคนโหวตเลือกสถานที่ท่องเที่ยวที่ชื่นชอบ 
                ระบบประชาธิปไตยแบบเต็มรูปแบบ
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-3 text-center">
                ผู้ช่วย AI
              </h3>
              <p className="text-gray-600 text-sm sm:text-base text-center leading-relaxed">
                รับคำแนะนำอัจฉริยะตามความชอบของกลุ่ม 
                AI วิเคราะห์และแนะนำสถานที่ที่ดีที่สุด
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 sm:mt-20 lg:mt-24 bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-12">
            วิธีการใช้งาน
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-3">
                สร้างทริป
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                เริ่มต้นด้วยการสร้างทริปใหม่และเชิญเพื่อนๆ เข้าร่วม
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-3">
                ร่วมแสดงความคิดเห็น
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                ทุกคนกรอกข้อมูลและโหวตสถานที่ที่ต้องการไป
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 mx-auto">
                3
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-3">
                ปล่อยให้ AI ช่วย
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                รับคำแนะนำจาก AI และเริ่มต้นทริปในฝันของคุณ
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-10 sm:mt-12 text-center">
            <button
              onClick={() => router.push(`/CreateTripPage`)}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>เริ่มวางแผนทริปของคุณ</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;