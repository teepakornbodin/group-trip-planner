"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const ResetPasswordPage = () => {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // อ่าน token จาก hash fragment (#access_token=...)
  useEffect(() => {
    const hash = window.location.hash; // ex: #access_token=XXX&refresh_token=YYY
    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      setAccessToken(params.get("access_token"));
      setRefreshToken(params.get("refresh_token"));
    }
  }, []);

  const validatePassword = (pwd: string) => {
    const errors = [];
    if (pwd.length < 8) errors.push("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!/[A-Z]/.test(pwd)) errors.push("ต้องมีตัวอักษรพิมพ์ใหญ่ อย่างน้อย 1 ตัว");
    if (!/[0-9]/.test(pwd)) errors.push("ต้องมีตัวเลข อย่างน้อย 1 ตัว");
    return errors;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken || !refreshToken) {
      Swal.fire({ icon: "error", title: "ไม่พบ token", text: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({ icon: "warning", title: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      Swal.fire({ icon: "error", title: "รหัสผ่านไม่ถูกต้อง", html: passwordErrors.join("<br>") });
      return;
    }

    // ตั้ง session จาก access + refresh token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      Swal.fire({ icon: "error", title: "ไม่สามารถตั้งค่า session", text: sessionError.message });
      return;
    }

    // อัปเดตรหัสผ่าน
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
        let message = error.message;
        if (message.includes("New password should be different from the old password")) {
            message = "รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเก่า";
         }
      Swal.fire({ icon: "error", title: "ไม่สามารถเปลี่ยนรหัสผ่าน", text: message });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "เปลี่ยนรหัสผ่านสำเร็จ 🎉",
      text: "คุณสามารถเข้าสู่ระบบได้แล้ว",
    }).then(() => router.push("/LoginPage"));
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative"
      >
        <h2 className="text-2xl font-bold mb-6 text-purple-600 text-center">ตั้งรหัสผ่านใหม่</h2>

        <div className="relative h-10 mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่านใหม่"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600 placeholder-gray-400"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative h-10 mb-6">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600 placeholder-gray-400"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
        >
          ตั้งรหัสผ่านใหม่
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
