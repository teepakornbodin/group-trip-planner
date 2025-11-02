// app/RecommendationPage/[tripCode]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Users,
  Bot,
  Check,
  ExternalLink,
  Calendar,
  Compass,
  TrendingUp
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { usePlaces } from "../../../hooks/usePlaces";
import { useVoting } from "../../../hooks/useVoting";
import { useTripSummary } from "../../../hooks/useTripSummary";
import { useParticipants } from "../../../hooks/useParticipants";

const AIRecommendationPage = () => {
  const router = useRouter();
  const params = useParams();
  const tripCode = Array.isArray(params.tripCode) 
    ? params.tripCode[0] 
    : (params.tripCode as string | undefined);

  const { recommendations, loading: placesLoading, generateRecommendations, fetchRecommendations } = usePlaces();
  const { votes, submitVote, submitting } = useVoting(tripCode);
  const { summary } = useTripSummary(tripCode);
  const { participants, fetchParticipants, loading: participantsLoading } = useParticipants();

  const [currentUser, setCurrentUser] = useState<string>("นิรนาม");
  const [voterToken, setVoterToken] = useState<string>("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // โหลด participants
  useEffect(() => {
    if (tripCode) fetchParticipants(tripCode);
  }, [tripCode, fetchParticipants]);

  // สร้าง voter token
  useEffect(() => {
    const ensureToken = () => {
      let token = localStorage.getItem("voter_token");
      if (!token) {
        token = `vt_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
        localStorage.setItem("voter_token", token);
      }
      setVoterToken(token);
    };
    ensureToken();
    localStorage.setItem("user_nickname", "นิรนาม");
    setCurrentUser("นิรนาม");
  }, []);

  // โหลด recommendations
  useEffect(() => {
    async function run() {
      if (!tripCode) {
        setLoadingRecommendations(false);
        return;
      }
      try {
        if (!recommendations.length) {
          const existed = await fetchRecommendations(tripCode);
          if (!existed?.length) {
            await generateRecommendations(tripCode);
          }
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    }
    run();
  }, [tripCode, generateRecommendations, fetchRecommendations, recommendations.length]);

  const handleVote = async (placeUuid: string, type: "up" | "down") => {
    if (!tripCode || !voterToken) return;
    try {
      await submitVote(tripCode, placeUuid, "นิรนาม", type);
    } catch (error: any) {
      alert(error?.message || 'Failed to submit vote');
      console.error('Failed to submit vote:', error);
    }
  };

  const getVoteStats = (placeUuid: string) => {
    const itemVotes = votes.filter(v => v.recommendation_id === placeUuid);
    const upvotes = itemVotes.filter(v => v.vote_type === "up").length;
    const downvotes = itemVotes.filter(v => v.vote_type === "down").length;
    return { upvotes, downvotes, total: upvotes + downvotes };
  };

  const getUserVote = (_placeUuid: string): "up" | "down" | undefined => {
    return undefined;
  };

  const handleCompleteVoting = () => {
    router.push(`/TripSummaryPage/${tripCode}`);
  };

  const tripAnalysis = summary ? {
    totalParticipants: summary.participants?.total || 0,
    topProvince: summary.popular_provinces?.[0]?.province || '-',
    topProvinceVotes: summary.popular_provinces?.[0]?.count || 0,
    avgBudget: summary.budget_stats?.average || 0,
    topStyles: (summary.popular_travel_styles || []).slice(0, 3),
    commonDatesCount: summary.common_dates?.length || 0
  } : null;

  const travelStyleLabels: Record<string, { label: string; emoji: string }> = {
    beach: { label: 'ทะเล', emoji: '🏖️' },
    mountain: { label: 'ภูเขา', emoji: '⛰️' },
    temple: { label: 'วัด', emoji: '🏛️' },
    cafe: { label: 'คาเฟ่', emoji: '☕' },
    shopping: { label: 'ช็อปปิ้ง', emoji: '🛍️' },
    nature: { label: 'ธรรมชาติ', emoji: '🌿' },
    culture: { label: 'วัฒนธรรม', emoji: '🎭' }
  };

  // Loading State
  if (placesLoading || loadingRecommendations || participantsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">กำลังโหลด...</h2>
            <p className="text-gray-600">กำลังเตรียมข้อมูลสำหรับโหวต</p>
          </div>
        </main>
      </div>
    );
  }

  // No Recommendations State
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบสถานที่แนะนำ</h2>
            <p className="text-gray-600 mb-6">ลองสร้างใหม่อีกครั้ง</p>
            <button 
              onClick={() => router.back()} 
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold"
            >
              กลับ
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header with Trip Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">สถานที่แนะนำ</h1>
          </div>

          {tripAnalysis && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-5 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                สรุปความต้องการของกลุ่ม
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {tripAnalysis.totalParticipants}
                  </div>
                  <div className="text-xs text-gray-600">คน</div>
                </div>

                <div className="bg-white rounded-lg p-3 text-center">
                  <MapPin className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-600 truncate">
                    {tripAnalysis.topProvince}
                  </div>
                  <div className="text-xs text-gray-600">
                    {tripAnalysis.topProvinceVotes} คนเลือก
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 text-center">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">
                    ฿{tripAnalysis.avgBudget.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">งบเฉลี่ย/คน</div>
                </div>

                <div className="bg-white rounded-lg p-3 text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {tripAnalysis.commonDatesCount}
                  </div>
                  <div className="text-xs text-gray-600">วันที่ตรงกัน</div>
                </div>
              </div>

              {tripAnalysis.topStyles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Compass className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      สไตล์การเที่ยวยอดนิยม:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tripAnalysis.topStyles.map(({ style, count }: any) => (
                      <span 
                        key={style}
                        className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-700 border border-purple-200"
                      >
                        {travelStyleLabels[style]?.emoji} {travelStyleLabels[style]?.label || style}
                        <span className="ml-1 text-purple-500">({count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700">
              <Users className="w-4 h-4 inline mr-2" />
              คุณ: <span className="font-semibold">{currentUser || 'นิรนาม'}</span>
            </p>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="bg-white shadow-xl rounded-lg">
          <div className="space-y-6 p-6">
            {recommendations.map((item) => {
              const stats = getVoteStats(item.id);
              const userVote = getUserVote(item.id);

              return (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {item.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{item.rating.toFixed(1)}/5</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>~{item.estimatedCost} บาท</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">{item.description}</p>

                  {/* Pros & Cons */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 text-sm">ข้อดี</h4>
                      <ul className="space-y-1">
                        {item.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-green-600 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 text-sm">ข้อควรพิจารณา</h4>
                      <ul className="space-y-1">
                        {item.cons.map((con, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start">
                            <span className="text-red-500 mr-2">!</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${item.place_id}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm mb-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>ดูใน Google Maps</span>
                  </a>

                  {/* Voting Buttons */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">โหวตของคุณ:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVote(item.id, "up")}
                            disabled={submitting}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                              userVote === "up" 
                                ? "bg-green-100 text-green-700 border-2 border-green-300" 
                                : "bg-gray-100 text-gray-600 hover:bg-green-50"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm font-medium">ชอบ</span>
                          </button>

                          <button
                            onClick={() => handleVote(item.id, "down")}
                            disabled={submitting}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                              userVote === "down" 
                                ? "bg-red-100 text-red-700 border-2 border-red-300" 
                                : "bg-gray-100 text-gray-600 hover:bg-red-50"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm font-medium">ไม่ชอบ</span>
                          </button>
                        </div>
                      </div>

                      {userVote && (
                        <div className="text-sm text-gray-500">
                          <Check className="w-4 h-4 text-green-500 inline mr-1" />
                          โหวตแล้ว
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complete Voting Button */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <div className="text-center">
            <button
              onClick={handleCompleteVoting}
              className="px-8 py-3 rounded-lg font-semibold transition-colors bg-purple-500 hover:bg-purple-600 text-white"
            >
              เสร็จสิ้นการโหวต
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AIRecommendationPage;