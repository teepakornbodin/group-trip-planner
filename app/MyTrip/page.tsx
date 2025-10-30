"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Swal from "sweetalert2";
import { Trash2, Calendar, ExternalLink, Plus } from "lucide-react";

interface Trip {
  id: string;
  title: string;
  trip_code: string;
  created_at: string;
}

const formatTripDate = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (e) {
    return `วันที่: ${timestamp.substring(0, 10)}`;
  }
};

const MyTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const handleDeleteTrip = async (tripId: string, tripTitle: string) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      html: `คุณกำลังจะลบทริป<br/><strong>"${tripTitle}"</strong><br/>การดำเนินการนี้ไม่สามารถย้อนกลับได้!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#805ad5",
      confirmButtonText: "ใช่, ลบทริป!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("trips").delete().eq("id", tripId);

    if (error) {
      setError(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        `ไม่สามารถลบทริปได้: ${error.message}`,
        "error"
      );
    } else {
      setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      Swal.fire("ลบสำเร็จ!", "ทริปของคุณถูกลบเรียบร้อยแล้ว", "success");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchMyTrips = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setError("กรุณาเข้าสู่ระบบเพื่อดูทริปของคุณ");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("trips")
        .select("id, title, trip_code, created_at")
        .eq("creator_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTrips(data as Trip[]);
      }
      setLoading(false);
    };

    fetchMyTrips();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลดทริป...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">เกิดข้อผิดพลาด</h2>
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              ทริปของฉัน
            </h1>
            <p className="text-purple-100 text-sm sm:text-base">
              จัดการและติดตามทริปท่องเที่ยวของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {trips.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-7xl mb-6">✈️</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              ยังไม่มีทริปที่สร้างไว้
            </h2>
            <p className="text-gray-600 mb-8 text-sm sm:text-base max-w-md mx-auto">
              เริ่มวางแผนทริปครั้งแรกของคุณ สร้างความทรงจำที่ดีไปด้วยกัน!
            </p>
            <Link
              href="/CreateTripPage"
              className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>สร้างทริปใหม่</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Trip Count */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">ทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {trips.length} ทริป
                    </p>
                  </div>
                </div>
                <Link
                  href="/CreateTripPage"
                  className="hidden sm:flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างทริปใหม่</span>
                </Link>
              </div>
            </div>

            {/* Trips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6">
                    <Link href={`/TripSummaryPage/${trip.trip_code}`}>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:underline line-clamp-2">
                        {trip.title}
                      </h2>
                    </Link>
                    <p className="text-purple-100 text-xs sm:text-sm">
                      รหัส: {trip.trip_code}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center text-gray-600 mb-4 sm:mb-6">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">
                        {formatTripDate(trip.created_at)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link
                        href={`/TripSummaryPage/${trip.trip_code}`}
                        className="flex-1 flex items-center justify-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>ดูทริป</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteTrip(trip.id, trip.title)}
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Create Button (Floating) */}
            <Link
              href="/create-CreateTripPage"
              className="sm:hidden fixed bottom-6 right-6 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-2xl z-50 transition-all hover:scale-110"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </>
        )}
      </main>
    </div>
  );
};

export default MyTripsPage;