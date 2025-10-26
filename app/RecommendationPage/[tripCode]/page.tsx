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
} from "lucide-react";
import { useRouter } from "next/navigation";

const AIRecommendationPage = () => {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<number, Record<string, string>>>({});
  const [currentUser] = useState("อลิซ"); // Mock current user
  const [votingComplete, setVotingComplete] = useState(false);

  // Mock AI recommendations
  const mockRecommendations = [
    {
      id: 1,
      name: "วัดพระธาตุดอยสุเทพ",
      type: "สถานที่ท่องเที่ยว",
      description:
        "วัดที่มีชื่อเสียงบนดอยสุเทพ เชียงใหม่ มีวิวเมืองที่สวยงามและเป็นสถานที่ศักดิ์สิทธิ์",
      rating: 4.8,
      estimatedCost: 50,
      duration: "2-3 ชั่วโมง",
      location: "เชียงใหม่",
      pros: ["วิวสวยงาม", "ใกล้เมือง", "สถานที่ศักดิ์สิทธิ์"],
      cons: ["ขึ้นเขาชัน", "นักท่องเที่ยวเยอะ"],
    },
    {
      id: 2,
      name: "ตลาดเจ้าพระยา",
      type: "แหล่งช็อปปิ้ง",
      description:
        "ตลาดท้องถิ่นที่มีของกินและของที่ระลึกมากมาย บรรยากาศแบบดั้งเดิม",
      rating: 4.5,
      estimatedCost: 300,
      duration: "1-2 ชั่วโมง",
      location: "เชียงใหม่",
      pros: ["ของถูก", "ของกินเยอะ", "บรรยากาศดี"],
      cons: ["แออัด", "ร้อน"],
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 2000);
  }, []);

  const handleVote = (id: number, type: "up" | "down") => {
    setVotes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [currentUser]: type,
      },
    }));
  };

  const getVoteStats = (id: number) => {
    const itemVotes = votes[id] || {};
    const upvotes = Object.values(itemVotes).filter((v) => v === "up").length;
    const downvotes = Object.values(itemVotes).filter((v) => v === "down")
      .length;
    return { upvotes, downvotes, total: upvotes + downvotes };
  };

  const getUserVote = (id: number) => votes[id]?.[currentUser];

  const allItemsVoted =
    recommendations.length > 0 &&
    recommendations.every((rec) => getUserVote(rec.id));

  const handleCompleteVoting = () => {
    setVotingComplete(true);
  };

  // 🟣 Loading UI
  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            AI กำลังวิเคราะห์ข้อมูล
          </h2>
          <p className="text-gray-600">
            กำลังประมวลผลข้อมูลของทุกคนเพื่อหาสถานที่ที่เหมาะสมที่สุด...
          </p>
        </div>
      </main>
    );
  }

  // 🟢 Complete Voting UI
  if (votingComplete) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            การโหวตเสร็จสิ้นแล้ว!
          </h2>
          <p className="text-gray-600 mb-8">
            ขอบคุณสำหรับการโหวต AI กำลังสร้างแผนการเดินทางที่สมบูรณ์ตามผลโหวตของทุกคน
          </p>
          <button onClick={() => router.push('/TripSummaryPage')} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            ดูแผนการเดินทาง
          </button>
        </div>
      </main>
    );
  }

  // 🟡 Voting UI
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-t-2xl shadow-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">คำแนะนำจากที่เลือก</h1>
        </div>
        <p className="text-gray-600 mb-4">
          วิเคราะห์ข้อมูลของทุกคนแล้ว กรุณาโหวตเพื่อเลือกสถานที่ที่คุณชอบ
        </p>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-700">
            <Users className="w-4 h-4 inline mr-2" />
            คะแนนโหวต: {currentUser} | ความคืบหน้า:{" "}
            {Object.keys(votes).length}/{recommendations.length} รายการ
          </p>
        </div>
      </div>

      <div className="bg-white shadow-xl">
        <div className="space-y-6 p-6">
          {recommendations.map((item) => {
            const stats = getVoteStats(item.id);
            const userVote = getUserVote(item.id);

            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {item.name}
                    </h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {item.type}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{item.description}</p>

                {/* Voting buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVote(item.id, "up")}
                    className={`px-4 py-2 rounded-lg ${
                      userVote === "up"
                        ? "bg-green-200 text-green-700"
                        : "bg-gray-100 hover:bg-green-50"
                    }`}
                  >
                    👍 {stats.upvotes}
                  </button>
                  <button
                    onClick={() => handleVote(item.id, "down")}
                    className={`px-4 py-2 rounded-lg ${
                      userVote === "down"
                        ? "bg-red-200 text-red-700"
                        : "bg-gray-100 hover:bg-red-50"
                    }`}
                  >
                    👎 {stats.downvotes}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-xl p-6 text-center">
        <button
          onClick={() => {
          handleCompleteVoting(); 
        }}
          disabled={!allItemsVoted}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            allItemsVoted
              ? "bg-purple-500 hover:bg-purple-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          เสร็จสิ้นการโหวต
        </button>
      </div>
    </main>
  );
};

export default AIRecommendationPage;
