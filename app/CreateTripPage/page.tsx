"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";
import { Copy, Check, QrCode } from "lucide-react";

const CreateTripPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [tripTitle, setTripTitle] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#8b5cf6",
          }).then(() => router.push("/LoginPage"));
          return;
        }

        // ดึง profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        setUsername(profile?.username || session.user.email || "");
      } catch (error) {
        console.error("Auth check error:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const showSuccessModal = (tripCode: string) => {
    const tripUrl = `http://localhost:3000/TripFormPage/${tripCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      tripUrl
    )}`;

    Swal.fire({
      title: '<span style="color: #8b5cf6; font-size: 28px;">🎉 สร้างทริปสำเร็จ!</span>',
      html: `
        <div style="padding: 20px 10px;">
          <!-- Trip Code -->
          <div style="margin-bottom: 25px;">
            <p style="color: #6b7280; margin-bottom: 8px;">รหัสทริปของคุณ</p>
            <div style="background: #f3e8ff; padding: 12px; border-radius: 10px; font-size: 24px; font-weight: bold; color: #8b5cf6; letter-spacing: 2px;">
              ${tripCode}
            </div>
          </div>

          <!-- QR Code -->
          <div style="margin-bottom: 25px;">
            <p style="color: #6b7280; margin-bottom: 12px; font-weight: 600;">
              <svg style="display: inline; width: 18px; height: 18px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" stroke-width="2"></rect>
                <rect x="14" y="3" width="7" height="7" stroke-width="2"></rect>
                <rect x="14" y="14" width="7" height="7" stroke-width="2"></rect>
                <rect x="3" y="14" width="7" height="7" stroke-width="2"></rect>
              </svg>
              สแกน QR Code เพื่อเข้าร่วมทริป
            </p>
            <div style="background: white; padding: 15px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 250px; height: 250px; display: block;" />
            </div>
          </div>

          <!-- Share Link -->
          <div style="margin-bottom: 20px;">
            <p style="color: #6b7280; margin-bottom: 8px; font-weight: 600;">
              <svg style="display: inline; width: 18px; height: 18px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              ลิงก์สำหรับแชร์
            </p>
            <div style="display: flex; align-items: center; gap: 8px; background: #f9fafb; padding: 12px; border-radius: 10px; border: 2px solid #e5e7eb;">
              <input 
                id="tripUrlInput" 
                type="text" 
                value="${tripUrl}" 
                readonly
                style="flex: 1; border: none; background: transparent; color: #374151; font-size: 14px; outline: none; padding: 0;"
              />
              <button 
                id="copyButton"
                type="button"
                style="background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; white-space: nowrap;"
              >
                <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-width="2"></path>
                </svg>
                คัดลอก
              </button>
            </div>
          </div>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            แชร์ลิงก์หรือ QR Code ให้เพื่อนๆ เพื่อเข้าร่วมทริป
          </p>
        </div>
      `,
      width: 600,
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ไปที่หน้าทริป",
      cancelButtonText: "ปิด",
      customClass: {
        popup: "swal-trip-success",
      },
      didOpen: () => {
        // เพิ่ม event listener หลัง modal เปิด
        const copyButton = document.getElementById("copyButton");
        if (copyButton) {
          copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(tripUrl);
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `
              <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              คัดลอกแล้ว
            `;
            copyButton.style.background = "#10b981";
            
            setTimeout(() => {
              copyButton.innerHTML = originalHTML;
              copyButton.style.background = "#8b5cf6";
            }, 2000);
          });

          // เพิ่ม hover effect
          copyButton.addEventListener("mouseenter", () => {
            if (copyButton.style.background !== "rgb(16, 185, 129)") {
              copyButton.style.background = "#7c3aed";
            }
          });
          
          copyButton.addEventListener("mouseleave", () => {
            if (copyButton.style.background !== "rgb(16, 185, 129)") {
              copyButton.style.background = "#8b5cf6";
            }
          });
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/TripFormPage/${tripCode}`);
      }
    });
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim()) {
      return Swal.fire({ icon: "warning", title: "กรุณาใส่ชื่อทริป" });
    }

    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("กรุณาเข้าสู่ระบบ");

      // สร้าง profile ถ้ายังไม่มี
      await supabase.from("profiles").upsert({
        id: session.user.id,
        username: username || session.user.email,
      });

      // สร้าง trip code แบบสุ่ม
      const tripCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Insert trip พร้อม creator_id
      const { error } = await supabase
        .from("trips")
        .insert([
          {
            trip_code: tripCode,
            title: tripTitle,
            status: "planning",
            max_participants: 10,
            creator_id: session.user.id,
            ai_processing_complete: false,
            voting_complete: false,
            plan_generated: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // แสดง modal พร้อม QR Code
      showSuccessModal(tripCode);
    } catch (error: any) {
      console.error("Create trip error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถสร้างทริปได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center text-purple-600 mb-2">
            สร้างทริปใหม่
          </h1>
          <p className="text-center text-gray-600">
            สวัสดี,{" "}
            <span className="font-semibold text-purple-600">{username}</span>
          </p>
        </div>

        <form onSubmit={handleCreateTrip} className="space-y-6">
          <div>
            <label
              htmlFor="tripTitle"
              className="block text-gray-700 mb-2 font-medium"
            >
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
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            {isLoading ? "กำลังสร้างทริป..." : "สร้างทริป"}
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