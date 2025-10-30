"use client";

import React, { useEffect, useState } from "react";
// ✅ เพิ่ม: ใช้ Supabase client สำหรับ Client Component
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
// 🚨 ต้องติดตั้ง: npm install sweetalert2
// 💡 SweetAlert2 ต้อง Import แบบ Dynamic เพื่อป้องกันปัญหา SSR
import dynamic from 'next/dynamic';

import Swal from "sweetalert2";

interface Trip {
  id: string;
  title: string;
  trip_code: string;
  created_at: string;
}

const formatTripDate = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
        }).format(date);
    } catch (e) {
        return `วันที่: ${timestamp.substring(0, 10)}`; 
    }
};

const MyTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 💡 สร้าง Client
  const supabase = createClientComponentClient();

  // ✅ ปรับปรุง: ใช้ SweetAlert2
  const handleDeleteTrip = async (tripId: string) => {
    if (!Swal) return; // ป้องกันการเรียกใช้ก่อนโหลดเสร็จ

    const result = await Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณกำลังจะลบทริปนี้ การดำเนินการนี้ไม่สามารถย้อนกลับได้!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#805ad5", // สีม่วง
        confirmButtonText: "ใช่, ลบทริป!",
        cancelButtonText: "ยกเลิก"
    });

    if (!result.isConfirmed) {
        return;
    }

    setLoading(true);
    setError(null);

    // ลบข้อมูลจากตาราง 'trips' ใน Supabase
    const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

    if (error) {
        setError(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
        Swal.fire("เกิดข้อผิดพลาด", `ไม่สามารถลบทริปได้: ${error.message}`, "error");
    } else {
        // อัปเดต State โดยการกรองทริปที่ถูกลบออกไป
        setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        Swal.fire("ลบสำเร็จ!", "ทริปของคุณถูกลบเรียบร้อยแล้ว", "success");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchMyTrips = async () => {
        // ... (โค้ดเดิมสำหรับการดึงข้อมูลทริป)
        
        setLoading(true);
        setError(null);

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
            setError("Please login to see your trips.");
            setLoading(false);
            return;
        } 

        const { data, error } = await supabase
            .from("trips")
            .select("id, title,trip_code, created_at")
            .eq("creator_id", session.user.id) 
            .order("created_at", { ascending: true });

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
      <div className="flex justify-center items-center h-screen">
                <p>Loading trips...</p>     
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 font-semibold text-xl">{error}</p>   
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <h1 className="text-3xl text-purple-600 font-bold mb-6 text-center">
                ทริปของฉัน      
      </h1>
      {trips.length === 0 ? (
        <p className="text-center text-gray-500">
                    คุณยังไม่มีทริปที่สร้างไว้เลย เริ่มวางแผนทริปกันเถอะ!      
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition hover:translate-y-[-2px] duration-300 h-full flex flex-col justify-between "
            >
                           
              <Link href={`/TripSummaryPage/${trip.trip_code}`} className="block">
                <h2 className="text-3xl font-semibold text-purple-600 text-center">
                  {trip.title}
                </h2>
              </Link>
                           
              <p className="text-gray-500 mt-2">สร้างเมื่อ: {formatTripDate(trip.created_at)}</p>

              <button
                onClick={() => handleDeleteTrip(trip.id)}
                className="text-m px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:bg-red-600 text-white font-bold py-1 px- rounded transition duration-200"
                disabled={loading}
              >
                {loading ? 'กำลังลบ...' : 'ลบทริป'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;