"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ResetPasswordPage`,
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อย 🎉",
        text: "ตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-600">ลืมรหัสผ่าน</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600 placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
        >
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
};

export default ForgetPasswordPage;
