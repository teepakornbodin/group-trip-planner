"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

const CreateTripPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [tripTitle, setTripTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // ถ้ายังไม่ได้ login ให้แสดง popup แล้ว redirect ไปหน้า login
        Swal.fire({
          icon: "warning",
          title: "กรุณาเข้าสู่ระบบ",
          text: "คุณต้องเข้าสู่ระบบก่อนสร้างทริป",
          confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
          confirmButtonColor: "#8b5cf6"
        }).then(() => {
          router.push("/LoginPage");
        });
        return;
      }

      // ดึงข้อมูล profile ของผู้ใช้
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripTitle.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาใส่ชื่อทริป"
      });
      return;
    }

    try {
      // สร้าง trip code แบบสุ่ม (6 ตัวอักษร)
      const tripCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: session } = await supabase.auth.getSession();
      
      // บันทึกข้อมูลทริปลงฐานข้อมูล
      const { data, error } = await supabase
        .from("trips")
        .insert([
          {
            trip_code: tripCode,
            title: tripTitle,
            status: "planning",
            max_participants: 10,
            ai_processing_complete: false,
            voting_complete: false,
            plan_generated: false,
            creator_ip: null // หรือเก็บ IP ถ้าต้องการ
          }
        ])
        .select()
        .single();

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "สร้างทริปสำเร็จ! 🎉",
        html: `รหัสทริปของคุณคือ: <strong>${tripCode}</strong><br>เก็บรหัสนี้ไว้เพื่อแชร์ให้เพื่อนๆ`,
        confirmButtonColor: "#8b5cf6"
      }).then(() => {
        router.push(`/trip/${tripCode}`);
      });

    } catch (error: any) {
      console.error("Create trip error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถสร้างทริปได้"
      });
    }
  };

  // แสดง loading ขณะตรวจสอบ auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ได้ auth จะไม่แสดงฟอร์ม
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center text-purple-600 mb-2">
            สร้างทริปใหม่
          </h1>
          <p className="text-center text-gray-600">
            สวัสดี, <span className="font-semibold text-purple-600">{username}</span>
          </p>
        </div>

        <form onSubmit={handleCreateTrip} className="space-y-6">
          <div>
            <label htmlFor="tripTitle" className="block text-gray-700 mb-2 font-medium">
              ชื่อทริป
            </label>
            <input
              type="text"
              id="tripTitle"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              placeholder="เช่น ทริปเที่ยวเชียงใหม่ปีใหม่"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-700 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            สร้างทริป
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
          >
            ยกเลิก
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateTripPage;