// D:\group-trip-planner\app\TripSummaryPage\[tripCode]\page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Users, Calendar, MapPin, DollarSign, Share2, Copy, Check, Compass, Bot, Download } from 'lucide-react';
import { useTrip } from '../../../hooks/useTrip';
import { useParticipants } from '../../../hooks/useParticipants';

const TripSummaryPage = () => {
  const router = useRouter();
  const params = useParams();
  const tripCode = Array.isArray(params.tripCode) ? params.tripCode[0] : params.tripCode;
  
  const { trip, loading: tripLoading, error: tripError, fetchTrip } = useTrip();
  const { participants, loading: participantsLoading, error: participantsError, fetchParticipants } = useParticipants();
  
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('สรุป');
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState(''); // เพิ่ม state สำหรับ share URL

  // Set share URL when component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && tripCode) {
      setShareUrl(`${window.location.origin}/TripFormPage/${tripCode}`);
    }
  }, [tripCode]);

  // Fetch trip and participants data
  useEffect(() => {
    if (tripCode) {
      fetchTrip(tripCode).catch(console.error);
      fetchParticipants(tripCode).catch(console.error);
    }
  }, [tripCode, fetchTrip, fetchParticipants]);

  useEffect(() => {
    // จำลองโหลดข้อมูล AI
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Handle share link
  const handleShare = async () => {
    if (!shareUrl) return; // ป้องกันกรณีที่ยังไม่ได้ set URL
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownloadPDF = () => {
    alert('กำลังดาวน์โหลด PDF...');
  };

  const handleRecommendation = () => {
    router.push(`/RecommendationPage/${tripCode}`);
  };

  // Travel style mapping
  const travelStyleMap: Record<string, { label: string; emoji: string }> = {
    beach: { label: 'ทะเล', emoji: '🏖️' },
    mountain: { label: 'ภูเขา', emoji: '⛰️' },
    temple: { label: 'วัด', emoji: '🏛️' },
    cafe: { label: 'คาเฟ่', emoji: '☕' },
    shopping: { label: 'ช็อปปิ้ง', emoji: '🛍️' },
    nature: { label: 'ธรรมชาติ', emoji: '🌿' },
    culture: { label: 'วัฒนธรรม', emoji: '🎭' }
  };

  // Calculate common dates
  const getCommonDates = () => {
    if (!participants || participants.length < 2) return [];
    
    const allDates = participants.map(p => p.available_dates).flat();
    const dateCount: Record<string, number> = {};
    
    allDates.forEach(date => {
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    
    return Object.entries(dateCount)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .map(([date, count]) => ({ date, count }));
  };

  // Calculate budget range
  const getBudgetRange = () => {
    if (!participants || participants.length === 0) return null;
    
    const budgets = participants.map(p => p.budget);
    return {
      min: Math.min(...budgets),
      max: Math.max(...budgets),
      avg: Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length)
    };
  };

  // Get popular provinces
  const getPopularProvinces = () => {
    if (!participants) return [];
    
    const provinceCount: Record<string, number> = {};
    participants.forEach(p => {
      provinceCount[p.preferred_province] = (provinceCount[p.preferred_province] || 0) + 1;
    });
    
    return Object.entries(provinceCount)
      .sort(([_, a], [__, b]) => b - a)
      .map(([province, count]) => ({ province, count }));
  };

  // Get popular travel styles
  const getPopularTravelStyles = () => {
    if (!participants) return [];
    
    const styleCount: Record<string, number> = {};
    participants.forEach(p => {
      p.travel_styles.forEach(style => {
        styleCount[style] = (styleCount[style] || 0) + 1;
      });
    });
    
    return Object.entries(styleCount)
      .sort(([_, a], [__, b]) => b - a)
      .map(([style, count]) => ({ style, count }))
      .slice(0, 5);
  };

  // Validation for tripCode
  if (!tripCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบรหัสทริป</h2>
          <p className="text-gray-600 mb-6">URL ไม่ถูกต้อง</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (tripLoading || participantsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tripError || participantsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{tripError || participantsError}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const commonDates = getCommonDates();
  const budgetRange = getBudgetRange();
  const popularProvinces = getPopularProvinces();
  const popularTravelStyles = getPopularTravelStyles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Navigation */}
      <nav className="">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับ
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">สรุปการวางแผนทริป</h1>
                <p className="text-purple-100">รหัสทริป: {trip?.trip_code}</p>
                <p className="text-purple-100 text-sm">
                  สร้างเมื่อ: {trip ? new Date(trip.created_at).toLocaleDateString('th-TH') : ''}
                </p>
              </div>
              <button
                onClick={handleShare}
                disabled={!shareUrl} // ปิดการใช้งานจนกว่าจะได้ URL
                className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'แชร์ลิงก์'}</span>
              </button>
            </div>
          </div>

          {/* Share Link Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">ลิงก์สำหรับเชิญเพื่อน</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={shareUrl} // ใช้ state แทน window.location.origin โดยตรง
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="กำลังโหลด URL..."
              />
              <button
                onClick={handleShare}
                disabled={!shareUrl}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>คัดลอก</span>
              </button>
            </div>
          </div>

          {/* Participants Count */}
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  ผู้เข้าร่วม: {participants?.length || 0} คน
                </h3>
                <p className="text-gray-600 text-sm">
                  {participants?.length === 0 && 'ยังไม่มีผู้เข้าร่วม แชร์ลิงก์เพื่อเชิญเพื่อน'}
                  {participants && participants.length === 1 && 'มีผู้เข้าร่วม 1 คน รอเพื่อนเพิ่มเติม'}
                  {participants && participants.length > 1 && 'เริ่มวิเคราะห์ข้อมูลเพื่อวางแผนทริปได้แล้ว!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {['สรุป', 'โหวต', 'Plan'].map((tab) => (
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

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          {activeTab === 'สรุป' && (
            <div>
              {/* Show analysis only if there are participants */}
              {participants && participants.length > 0 ? (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{participants.length}</div>
                      <div className="text-sm text-gray-600">จำนวนคน</div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{commonDates.length}</div>
                      <div className="text-sm text-gray-600">วันที่ตรงกัน</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {budgetRange ? budgetRange.avg.toLocaleString() : '0'}
                      </div>
                      <div className="text-sm text-gray-600">งบเฉลี่ย (บาท)</div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-orange-600">
                        {popularProvinces[0]?.province || 'ไม่มี'}
                      </div>
                      <div className="text-sm text-gray-600">จังหวัดยอดนิยม</div>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Users className="w-6 h-6 text-purple-600 mr-2" />
                      รายชื่อผู้เข้าร่วม
                    </h3>
                    <div className="space-y-4">
                      {participants.map((participant, index) => (
                        <div key={participant.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-800">{participant.nickname}</h4>
                            <span className="text-purple-600 font-medium">
                              ฿{participant.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                อยากไป: {participant.preferred_province}
                              </p>
                              <p className="text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                ว่าง: {participant.available_dates.length} วัน
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">สไตล์การเที่ยว:</p>
                              <div className="flex flex-wrap gap-1">
                                {participant.travel_styles.map(style => (
                                  <span key={style} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                    {travelStyleMap[style]?.emoji} {travelStyleMap[style]?.label || style}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis sections for multiple participants */}
                  {participants.length > 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Common Dates */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                          วันที่เหมาะสม
                        </h4>
                        {commonDates.length > 0 ? (
                          <div className="space-y-2">
                            {commonDates.slice(0, 5).map(({ date, count }) => (
                              <div key={date} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-gray-800">
                                  {new Date(date).toLocaleDateString('th-TH')}
                                </span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                  {count}/{participants.length} คน
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">ไม่มีวันที่ตรงกัน</p>
                        )}
                      </div>

                      {/* Popular Travel Styles */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Compass className="w-5 h-5 text-green-600 mr-2" />
                          สไตล์การเที่ยวยอดนิยม
                        </h4>
                        <div className="space-y-2">
                          {popularTravelStyles.map(({ style, count }) => (
                            <div key={style} className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-gray-800 flex items-center">
                                <span className="mr-2">{travelStyleMap[style]?.emoji}</span>
                                {travelStyleMap[style]?.label || style}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                {count} คน
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✈️</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">พร้อมเริ่มวางแผนทริปแล้ว!</h2>
                  <p className="text-gray-600 mb-6">
                    แชร์ลิงก์ด้านบนให้เพื่อนๆ เพื่อเริ่มเก็บข้อมูลการวางแผนทริปร่วมกัน
                  </p>
                  <button
                    onClick={handleShare}
                    disabled={!shareUrl}
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center space-x-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>แชร์ลิงก์ทันที</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {participants && participants.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>ดาวน์โหลด PDF</span>
                  </button>
                  
                  <button
                    onClick={handleRecommendation}
                    className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
                  >
                    <Bot className="w-5 h-5" />
                    <span>ให้ AI แนะนำสถานที่</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'โหวต' && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">โหวตสถานที่</h2>
              <p className="text-gray-600 mb-6">
                โหวตสถานที่จากที่นี่เพื่อให้ได้สถานที่ที่เหมาะสมกับทุกคน
              </p>
              <button
                onClick={handleRecommendation}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                เริ่มการโหวต
              </button>
            </div>
          )}

          {activeTab === 'Plan' && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                แผนการเดินทางจะปรากฏที่นี่
              </h2>
              <p className="text-gray-600">
                เมื่อเสร็จสิ้นการโหวตสถานที่แล้ว AI จะสร้างแผนการเดินทางที่สมบูรณ์ให้
              </p>
              {loading && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
                  <span className="text-gray-600">กำลังโหลดแผนการเดินทาง...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TripSummaryPage;