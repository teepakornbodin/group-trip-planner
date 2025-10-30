// app/login/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// ❌ ลบ: import { supabase } from "@/lib/supabaseClient";

// ✅ เพิ่ม: ใช้ createClientComponentClient สำหรับ Client Component Auth
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 

import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // 💡 แก้ไข: สร้าง Client ที่ผูกกับ Auth Helpers
  const supabase = createClientComponentClient(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let message = error.message;

      // parse email not confirmed
      if (message.includes("Email not confirmed")) {
        Swal.fire({
          icon: "info",
          title: "บัญชีของคุณยังไม่ได้ยืนยันอีเมล",
          html: `เราได้ส่งอีเมลไปที่ <strong>${email}</strong> โปรดเปิดอีเมลเพื่อยืนยันก่อนเข้าสู่ระบบ.<br><br>
                 หากไม่ได้รับอีเมล สามารถส่งใหม่ได้`,
          showCancelButton: true,
          confirmButtonText: "ส่งอีเมลยืนยันอีกครั้ง",
          cancelButtonText: "ปิด",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const { error: resendError } = await supabase.auth.resend({
              type: "signup",
              email,
            });

            if (resendError) {
              Swal.fire({
                icon: "error",
                title: "ไม่สามารถส่งอีเมลยืนยันได้",
                text: resendError.message,
              });
            } else {
              Swal.fire({
                icon: "success",
                title: "ส่งอีเมลยืนยันเรียบร้อย",
                text: "โปรดตรวจสอบกล่องจดหมายของคุณ",
              });
            }
          }
        });
        return;
      }

      // parse login failed
      if (message.includes("Invalid login credentials")) {
        message = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      }

      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: message,
      });
      return;
    }

    // login สำเร็จ
    Swal.fire({
      icon: "success",
      title: "Login สำเร็จ!",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => router.push("/"));
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมลของคุณ"
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600 placeholder-gray-400"
            />
          </div>

          <label htmlFor="password" className="block text-gray-700 mb-1">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่านของคุณ"
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10 text-gray-600 placeholder-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            เข้าสู่ระบบ
          </button>
          <div className="text-center mt-2">
            <a href="/ForgetPasswordPage" className="text-purple-600 hover:underline text-sm">
              ลืมรหัสผ่าน?
            </a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;