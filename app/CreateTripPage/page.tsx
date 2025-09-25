"use client";
import React, { useState } from 'react';
import { Calendar, Users, DollarSign, MapPin, Compass, QrCode, Copy, Check } from 'lucide-react';
import { useRouter } from "next/navigation";
const CreateTripPage = () => {
  const router = useRouter();
  const [tripCreated, setTripCreated] = useState(false);
  const [tripLink, setTripLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateTrip = () => {
    // Generate a unique trip ID (in real app, this would come from backend)
    const tripId = Math.random().toString(36).substr(2, 9);
    const link = `www.GroupTripPlanner.com/trip/${tripId}`;
    setTripLink(link);
    setTripCreated(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${tripLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tripCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">


        {/* Trip Created Success */}
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* QR Code */}
            <div className="mb-8">
              <div className="w-64 h-64 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                {/* QR Code Pattern */}
                <div className="grid grid-cols-17 gap-0.5 w-48 h-48">
                  {Array.from({ length: 289 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${
                        Math.random() > 0.6 ? 'bg-black' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Created Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Share this link with your friends so they can join your trip planning
            </p>

            {/* Link Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Link</p>
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border">
                <span className="text-gray-800 flex-1 text-left">{tripLink}</span>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 p-2 text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={copyToClipboard}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button className="border border-purple-500 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                Share QR Code
              </button>
              <button onClick={() => router.push(`/TripFormPage`)} className="border border-purple-500 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                test link
              </button>
            </div>
            
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">


      {/* Main Content */}
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
            {/* ขั้นตอนเมื่อสร้างทริป */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                เกิดอะไรขึ้นเมื่อคุณสร้างทริป?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">รับลิงก์แชร์ทริป</h3>
                    <p className="text-gray-600 text-sm">
                      คุณจะได้รับลิงก์เฉพาะสำหรับแชร์ให้เพื่อน ๆ เข้าร่วมทริป
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">เพื่อนกรอกความชอบ</h3>
                    <p className="text-gray-600 text-sm">
                      แต่ละคนสามารถกรอกวันว่าง งบประมาณ และสไตล์การเดินทางของตัวเอง
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">AI แนะนำแผนที่เหมาะสม</h3>
                    <p className="text-gray-600 text-sm">
                      AI จะวิเคราะห์ข้อมูลของทุกคนเพื่อแนะนำสถานที่และกิจกรรมที่เหมาะสม
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ตัวอย่างข้อมูลที่เพื่อนสามารถแชร์ */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                เพื่อน ๆ ของคุณสามารถแชร์ข้อมูลต่อไปนี้ได้:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">ชื่อและรายละเอียด</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">วันว่าง</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">งบประมาณ</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">ปลายทาง</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg col-span-2">
                  <Compass className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">สไตล์การเดินทางที่ชอบ</span>
                </div>
              </div>
            </div>

            {/* ปุ่มสร้างลิงก์ทริป */}
            <button
              onClick={handleCreateTrip}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              สร้างลิงก์ทริป
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default CreateTripPage;