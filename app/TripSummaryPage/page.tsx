"use client";
import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, MapPin, Compass, Download, Bot, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from "next/navigation";
import FinalTripPlan from '../FinalTripPlan/page';
const TripSummaryPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('สรุป');
  const [showDetails, setShowDetails] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    participants: false,
    dates: false,
    budget: false,
    provinces: false,
    styles: false
  });
    useEffect(() => {
    // จำลองโหลดข้อมูล AI
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 วินาที

    return () => clearTimeout(timer);
  }, []);

  // Mock data - in real app, this would come from backend
  const participants = [
    {
      id: 1,
      nickname: 'อลิซ',
      dates: ['2024-03-15', '2024-03-16', '2024-03-17', '2024-03-22', '2024-03-23'],
      budget: 5000,
      province: 'เชียงใหม่',
      travelStyle: ['mountain', 'cafe', 'culture']
    },
    {
      id: 2,
      nickname: 'บ๊อบ',
      dates: ['2024-03-16', '2024-03-17', '2024-03-18', '2024-03-23', '2024-03-24'],
      budget: 4500,
      province: 'เชียงใหม่',
      travelStyle: ['nature', 'temple', 'mountain']
    },
    {
      id: 3,
      nickname: 'แคโรล',
      dates: ['2024-03-17', '2024-03-18', '2024-03-19', '2024-03-24', '2024-03-25'],
      budget: 6000,
      province: 'ภูเก็ต',
      travelStyle: ['beach', 'shopping', 'cafe']
    }
  ];

  const travelStyleLabels = {
    beach: { label: 'ทะเล', emoji: '🏖️' },
    mountain: { label: 'ภูเขา', emoji: '⛰️' },
    temple: { label: 'วัด', emoji: '🏛️' },
    cafe: { label: 'คาเฟ่', emoji: '☕' },
    shopping: { label: 'ช็อปปิ้ง', emoji: '🛍️' },
    nature: { label: 'ธรรมชาติ', emoji: '🌿' },
    culture: { label: 'วัฒนธรรม', emoji: '🎭' }
  };

  // Calculate summary statistics
  const totalParticipants = participants.length;
  
  // Find common dates
  const allDates = participants.flatMap(p => p.dates);
  const dateCount = allDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const commonDates = Object.entries(dateCount)
    .filter(([date, count]) => count >= Math.ceil(totalParticipants * 0.5))
    .map(([date]) => date)
    .sort();

  // Calculate average budget
  const averageBudget = Math.round(participants.reduce((sum, p) => sum + p.budget, 0) / totalParticipants);

  // Find most popular province
  const provinceCount = participants.reduce((acc, p) => {
    acc[p.province] = (acc[p.province] || 0) + 1;
    return acc;
  }, {});
  const popularProvince = Object.entries(provinceCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Find most popular travel styles
  const styleCount = participants.flatMap(p => p.travelStyle).reduce((acc, style) => {
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {});
  const popularStyles = Object.entries(styleCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadPDF = () => {
    // In real app, this would generate and download a PDF
    alert('กำลังดาวน์โหลด PDF...');
  };

  const handleAIRecommendation = () => {
    // In real app, this would navigate to AI recommendation page
    alert('กำลังเตรียมคำแนะนำจาก AI...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">


      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {['สรุป', 'Ai', 'Plan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'สรุป' && (
          <div className="bg-white rounded-b-2xl shadow-xl p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{totalParticipants}</div>
                <div className="text-sm text-gray-600">จำนวนคน</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{commonDates.length}</div>
                <div className="text-sm text-gray-600">วันที่ตรงกัน</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{averageBudget.toLocaleString()}</div>
                <div className="text-sm text-gray-600">งบเฉลี่ย (บาท)</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-600">{popularProvince}</div>
                <div className="text-sm text-gray-600">จังหวัด</div>
              </div>
            </div>

            {/* Detailed Summary */}
            <div className="space-y-4 mb-8">
              {/* Participants */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('participants')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-500">ผู้เข้าร่วม ({totalParticipants} คน)</span>
                  </div>
                  {expandedSections.participants ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.participants && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {participants.map(participant => (
                        <div key={participant.id} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">{participant.nickname}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>งบ: {participant.budget.toLocaleString()} บาท</div>
                            <div>จังหวัด: {participant.province}</div>
                            <div>วันว่าง: {participant.dates.length} วัน</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {participant.travelStyle.map(style => (
                                <span key={style} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                  {travelStyleLabels[style]?.emoji} {travelStyleLabels[style]?.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Common Dates */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('dates')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-purple-500">วันที่ตรงกัน ({commonDates.length} วัน)</span>
                  </div>
                  {expandedSections.dates ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.dates && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mt-4">
                      {commonDates.map(date => (
                        <span key={date} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {new Date(date).toLocaleDateString('th-TH')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Popular Travel Styles */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('styles')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Compass className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-purple-500">สไตล์การเที่ยว</span>
                  </div>
                  {expandedSections.styles ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.styles && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-3 mt-4">
                      {popularStyles.map(([style, count]) => (
                        <div key={style} className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-2xl mb-1">{travelStyleLabels[style]?.emoji}</div>
                          <div className="text-sm font-medium text-green-700">{travelStyleLabels[style]?.label}</div>
                          <div className="text-xs text-green-600">{count} คน</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>ดาวน์โหลด PDF</span>
              </button>
              
              <button
                onClick={handleAIRecommendation}
                className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                <Bot className="w-5 h-5" />
                <span>ให้ตัวช่วยแนะนำ</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Ai' && (
          <div className="bg-white rounded-b-2xl shadow-xl p-6">
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI กำลังเตรียมคำแนะนำ</h2>
              <p className="text-gray-600 mb-6">
                ตัวช่วย AI จะวิเคราะห์ข้อมูลของทุกคนและแนะนำสถานที่ท่องเที่ยวที่เหมาะสม
              </p>
              <button
                onClick={() => router.push(`/AIRecommendationPage`)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                เริ่มการแนะนำ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Plan' && (
          <div className="bg-white rounded-b-2xl shadow-xl p-6">
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          แผนการเดินทางจะปรากฏที่นี่
        </h2>
        <p className="text-gray-600">
          เมื่อเสร็จสิ้นการโหวตสถานที่แล้ว AI จะสร้างแผนการเดินทางที่สมบูรณ์ให้
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          // Loading animation
          <div className="flex flex-col items-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
            <span className="text-gray-600">กำลังโหลดแผนการเดินทาง...</span>
          </div>
        ) : (
          // Show FinalTripPlan
          <FinalTripPlan />
        )}
      </div>
    </div>
        )}
      </main>
    </div>
  );
};

export default TripSummaryPage;