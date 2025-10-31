// app/TripSummaryPage/[tripCode]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Share2,
  Copy,
  Check,
  Compass,
  Bot,
  Download,
} from "lucide-react";

import { useTrip } from "../../../hooks/useTrip";
import { useParticipants } from "../../../hooks/useParticipants";
import FinalTripPlanView, { Plan } from "@/components/FinalTripPlanView";
import { generateTripPlanPDF } from '@/utils/generatePDF';
type VoteItem = {
  id: string;
  recommendation_id: string;
  vote_type: "up" | "down";
  voter_token?: string | null;
  participant_nickname?: string | null;
  participant_ip?: string | null;
  recommendation_name?: string | null;
  recommendation_type?: string | null;
  recommendation_location?: string | null;
  estimated_cost?: number | null;
  duration?: string | null;
  rating?: number | null;
  created_at?: string | null;
};

type Tally = {
  up: number;
  down: number;
  total: number;
  voters: Set<string>;
  name?: string | null;
};

const TripSummaryPage = () => {
  const router = useRouter();
  const params = useParams();
  const tripCode = Array.isArray(params.tripCode)
    ? params.tripCode[0]
    : (params.tripCode as string | undefined);

  const { trip, loading: tripLoading, error: tripError, fetchTrip } = useTrip();
  const {
    participants,
    loading: participantsLoading,
    error: participantsError,
    fetchParticipants,
  } = useParticipants();

  // โหวต
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [votesLoading, setVotesLoading] = useState(false);
  const [votesError, setVotesError] = useState<string | null>(null);

  // แผน
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [finalPlan, setFinalPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  // UI
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"สรุป" | "โหวต" | "Plan">("สรุป");
  const [shareUrl, setShareUrl] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // ===== โหลดข้อมูลหลัก =====
  useEffect(() => {
    if (!tripCode) return;
    fetchTrip(tripCode).catch(console.error);
    fetchParticipants(tripCode).catch(console.error);
    fetchVotesFull(tripCode).catch(console.error);
  }, [tripCode, fetchTrip, fetchParticipants]);

  // ===== โหวต (ใช้ /votes/full) =====
  const fetchVotesFull = async (code: string) => {
    setVotesLoading(true);
    setVotesError(null);
    try {
      const res = await fetch(`/api/trips/${code}/votes/full`);
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to fetch full votes");
      }
      setVotes(data.votes || []);
    } catch (e: any) {
      setVotesError(e.message || "Unknown error");
      setVotes([]);
    } finally {
      setVotesLoading(false);
    }
  };

  // ===== สร้างแผนจาก backend =====
  useEffect(() => {
  if (!tripCode || activeTab !== "Plan") return;
  
  const loadExistingPlan = async () => {
    try {
      const res = await fetch(`/api/trips/${tripCode}/plan`);
      const data = await res.json();
      
      if (res.ok && data?.success && data?.data) {
        setFinalPlan(data.data);
        console.log('Loaded existing plan:', data.fromCache ? 'from cache' : 'generated');
      }
    } catch (error) {
      console.log('No existing plan found');
    }
  };
  
  loadExistingPlan();
}, [tripCode, activeTab]);

// แก้ไข handleGeneratePlan
const handleGeneratePlan = async (forceNew = false) => {
  if (!tripCode || (!canGeneratePlan && !forceNew)) return;
  
  try {
    setPlanError(null);
    setCreatingPlan(true);
    setFinalPlan(null);

    // 1) สร้าง snapshot (เก็บหลังบ้าน)
    const snapshotRes = await fetch(`/api/trips/${tripCode}/ai/snapshot`, {
      method: "POST",
    });
    const snapshotData = await snapshotRes.json();
    if (!snapshotRes.ok || !snapshotData?.success) {
      throw new Error(snapshotData?.error || "สร้าง snapshot ไม่สำเร็จ");
    }

    // 2) ขอแผนจาก AI (ส่ง forceNew ไปด้วย)
    const planRes = await fetch(`/api/trips/${tripCode}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forceNew }), // เพิ่มตรงนี้
    });
    const planData = await planRes.json();
    if (!planRes.ok || !planData?.success) {
      throw new Error(planData?.error || "Failed to generate plan data");
    }

    setFinalPlan(planData.data as Plan);
    
    // แจ้งเตือนว่าเป็น Plan เก่าหรือใหม่
    if (planData.fromCache && !forceNew) {
      console.log('ใช้แผนที่มีอยู่แล้ว');
    } else {
      console.log('สร้างแผนใหม่สำเร็จ');
    }
  } catch (err: any) {
    setPlanError(err.message || "An error occurred");
  } finally {
    setCreatingPlan(false);
  }
};

  // ใน TripSummaryPage
  const handleDownloadPDF = () => {
  // เก็บ active tab ปัจจุบัน
  const currentTab = activeTab;
  
  // เพิ่ม class สำหรับ print
  const element = document.getElementById(
    currentTab === "สรุป" ? 'summary-tab-content' :
    currentTab === "Plan" ? 'plan-tab-content' :
    'vote-tab-content'
  );
  
  if (!element) {
    alert('ไม่พบเนื้อหาที่จะดาวน์โหลด');
    return;
  }
  
  // เพิ่ม print styles
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      #${element.id}, #${element.id} * {
        visibility: visible;
      }
      #${element.id} {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      /* ซ่อนปุ่ม */
      button {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // เปิด print dialog
  window.print();
  
  // ลบ style หลัง print
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
};

/////////////////////////////
  const handleRecommendation = () => {
    if (tripCode) router.push(`/RecommendationPage/${tripCode}`);
  };

  // ===== UI helpers =====
  useEffect(() => {
    if (typeof window !== "undefined" && tripCode) {
      setShareUrl(`${window.location.origin}/TripFormPage/${tripCode}`);
    }
  }, [tripCode]);

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // ===== Metric / summary participants =====
  const travelStyleMap: Record<string, { label: string; emoji: string }> = {
    beach: { label: "ทะเล", emoji: "🏖️" },
    mountain: { label: "ภูเขา", emoji: "⛰️" },
    temple: { label: "วัด", emoji: "🏛️" },
    cafe: { label: "คาเฟ่", emoji: "☕" },
    shopping: { label: "ช็อปปิ้ง", emoji: "🛍️" },
    nature: { label: "ธรรมชาติ", emoji: "🌿" },
    culture: { label: "วัฒนธรรม", emoji: "🎭" },
  };

  const getCommonDates = () => {
    if (!participants || participants.length < 2) return [];
    const allDates = participants.map((p) => p.available_dates).flat();
    const dateCount: Record<string, number> = {};
    allDates.forEach((d) => (dateCount[d] = (dateCount[d] || 0) + 1));
    return Object.entries(dateCount)
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([date, count]) => ({ date, count }));
  };

  const getBudgetRange = () => {
    if (!participants || participants.length === 0) return null;
    const budgets = participants.map((p) => p.budget);
    return {
      min: Math.min(...budgets),
      max: Math.max(...budgets),
      avg: Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length),
    };
  };

  const getPopularProvinces = () => {
    if (!participants) return [];
    const m: Record<string, number> = {};
    participants.forEach((p) => {
      m[p.preferred_province] = (m[p.preferred_province] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([province, count]) => ({ province, count }));
  };

  const getPopularTravelStyles = () => {
    if (!participants) return [];
    const m: Record<string, number> = {};
    participants.forEach((p) => {
      p.travel_styles.forEach((s: string) => (m[s] = (m[s] || 0) + 1));
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([style, count]) => ({ style, count }))
      .slice(0, 5);
  };

  // ===== รวมโหวตตามสถานที่ =====
  const talliesByPlace = useMemo(() => {
    const map = new Map<string, Tally>();
    votes.forEach((v) => {
      const key = v.recommendation_id;
      if (!map.has(key)) {
        map.set(key, {
          up: 0,
          down: 0,
          total: 0,
          voters: new Set(),
          name: v.recommendation_name ?? null,
        });
      }
      const t = map.get(key)!;
      if (v.vote_type === "up") t.up += 1;
      if (v.vote_type === "down") t.down += 1;
      t.total += 1;

      const voterKey =
        (v.voter_token && v.voter_token.trim()) ||
        (v.participant_nickname && `nick:${v.participant_nickname.trim()}`) ||
        (v.participant_ip && `ip:${v.participant_ip.trim()}`) ||
        "";
      if (voterKey) t.voters.add(voterKey);
    });
    return map;
  }, [votes]);

  const topVotedPlaces = useMemo(() => {
    const rows = Array.from(talliesByPlace.entries()).map(([place, t]) => ({
      recommendation_id: place,
      name: t.name || "ไม่ทราบชื่อ",
      up: t.up,
      down: t.down,
      total: t.total,
      score: t.up - t.down,
      unique_voters: t.voters.size,
    }));
    if (!rows.length) return [];
    const maxTotal = rows.reduce((m, r) => Math.max(m, r.total), 0);
    return rows
      .filter((r) => r.total === maxTotal)
      .sort((a, b) => b.score - a.score);
  }, [talliesByPlace]);

  // ===== เกณฑ์เริ่มสร้างแผน =====
  const uniqueVotersCount = votes.length;
  const canGeneratePlan = uniqueVotersCount >= 2;

  // ===== Render Guards =====
  if (!tripCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบรหัสทริป</h2>
          <p className="text-gray-600 mb-6">URL ไม่ถูกต้อง</p>
          <button
            onClick={() => router.push("/")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  if (tripLoading || participantsLoading || votesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (tripError || participantsError || votesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">
            {tripError || participantsError || votesError}
          </p>
          <button
            onClick={() => router.push("/")}
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
        <div id="trip-summary-content">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">สรุปการวางแผนทริป</h1>
                <p className="text-purple-100">รหัสทริป: {trip?.trip_code}</p>
                <p className="text-purple-100 text-sm">
                  สร้างเมื่อ: {trip ? new Date(trip.created_at).toLocaleDateString("th-TH") : ""}
                </p>
              </div>
              <button
                onClick={handleShare}
                disabled={!shareUrl}
                className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "คัดลอกแล้ว!" : "แชร์ลิงก์"}</span>
              </button>
            </div>
          </div>

          {/* Share Link Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">ลิงก์สำหรับเชิญเพื่อน</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={shareUrl}
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
                  {participants?.length === 0 && "ยังไม่มีผู้เข้าร่วม แชร์ลิงก์เพื่อเชิญเพื่อน"}
                  {participants && participants.length === 1 && "มีผู้เข้าร่วม 1 คน รอเพื่อนเพิ่มเติม"}
                  {participants && participants.length > 1 && "เริ่มวิเคราะห์ข้อมูลเพื่อวางแผนทริปได้แล้ว!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {["สรุป", "โหวต", "Plan"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "สรุป" | "โหวต" | "Plan")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          {/* ========== TAB: สรุป ========== */}
          {activeTab === "สรุป" && (
            <div id="summary-tab-content">
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
                      <div className="text-2xl font-bold text-blue-600">{getCommonDates().length}</div>
                      <div className="text-sm text-gray-600">วันที่ตรงกัน</div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {getBudgetRange() ? getBudgetRange()!.avg.toLocaleString() : "0"}
                      </div>
                      <div className="text-sm text-gray-600">งบเฉลี่ย (บาท)</div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-orange-600">
                        {getPopularProvinces()[0]?.province || "ไม่มี"}
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
                      {participants.map((p) => (
                        <div key={p.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-800">{p.nickname}</h4>
                            <span className="text-purple-600 font-medium">
                              ฿{p.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                อยากไป: {p.preferred_province}
                              </p>
                              <p className="text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                ว่าง: {p.available_dates.length} วัน
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">สไตล์การเที่ยว:</p>
                              <div className="flex flex-wrap gap-1">
                                {p.travel_styles.map((style: string) => (
                                  <span
                                    key={style}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                  >
                                    {travelStyleMap[style]?.emoji}{" "}
                                    {travelStyleMap[style]?.label || style}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {participants.length > 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Common Dates */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                          วันที่เหมาะสม
                        </h4>
                        {getCommonDates().length > 0 ? (
                          <div className="space-y-2">
                            {getCommonDates()
                              .slice(0, 5)
                              .map(({ date, count }) => (
                                <div
                                  key={date}
                                  className="flex justify-between items-center p-2 bg-blue-50 rounded"
                                >
                                  <span className="text-gray-800">
                                    {new Date(date).toLocaleDateString("th-TH")}
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
                          {getPopularTravelStyles().map(({ style, count }) => (
                            <div
                              key={style}
                              className="flex justify-between items-center p-2 bg-green-50 rounded"
                            >
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
            disabled={downloadingPDF}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadingPDF
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
          >
            {downloadingPDF ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>กำลังสร้าง PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>ดาวน์โหลด PDF</span>
              </>
            )}
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

          {/* ========== TAB: โหวต ========== */}
          {activeTab === "โหวต" && (
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

          {/* ========== TAB: Plan ========== */}
          {activeTab === "Plan" && (
            <div id="plan-tab-content">
            <div className="py-8">
              {!finalPlan && !creatingPlan && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    แผนการเดินทางจะปรากฏที่นี่
                  </h2>
                  <p className="text-gray-600 mb-2">
                    เมื่อเสร็จสิ้นการโหวตสถานที่แล้ว AI จะสร้างแผนการเดินทางที่สมบูรณ์ให้
                  </p>


                  <div className="flex items-center justify-center gap-3 mt-4">
      <button
        onClick={() => handleGeneratePlan(false)}
        disabled={!canGeneratePlan}
        className={`px-8 py-3 rounded-lg font-semibold transition-colors
        ${
          canGeneratePlan
            ? "bg-purple-500 hover:bg-purple-600 text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        สร้างแผนการเดินทาง
      </button>

      <button
        onClick={() => tripCode && fetchVotesFull(tripCode)}
        className="px-8 py-3 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
      >
        รีเฟรชผลโหวต
      </button>
    </div>
  </div>
)}

              {creatingPlan && (
                <div className="p-6 bg-white rounded-xl flex flex-col items-center justify-center">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
                  <span className="text-gray-700 text-lg">กำลังสร้างแผนการเดินทาง...</span>
                  <p className="text-gray-500 text-sm mt-2">กรุณารอสักครู่</p>
                </div>
              )}

              {finalPlan && (
  <div>
    {/* เพิ่มปุ่มสร้างแผนใหม่ */}
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={() => handleGeneratePlan(true)}
        disabled={creatingPlan}
        className="px-4 py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
      >
        สร้างแผนใหม่
      </button>
    </div>
    
    <FinalTripPlanView
      plan={finalPlan}
      onDownload={handleDownloadPDF}
      downloading={downloadingPDF}
    />
  </div>
)}
            </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default TripSummaryPage;