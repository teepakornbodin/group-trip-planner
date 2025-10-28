"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const passwordRequirements = [
    "อย่างน้อย 8 ตัวอักษร",
    "มีตัวอักษรพิมพ์ใหญ่",
    "มีตัวเลข",
  ];

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!/[A-Z]/.test(password)) errors.push("ต้องมีตัวอักษรพิมพ์ใหญ่ อย่างน้อย 1 ตัว");
    if (!/[0-9]/.test(password)) errors.push("ต้องมีตัวเลข อย่างน้อย 1 ตัว");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // check password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      Swal.fire({ icon: "error", title: "รหัสผ่านไม่ถูกต้อง", html: passwordErrors.join("<br>") });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({ icon: "warning", title: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    // check username duplicate
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      Swal.fire({ icon: "error", title: "ชื่อผู้ใช้ซ้ำ", text: "ชื่อนี้มีคนใช้แล้ว โปรดลองชื่ออื่น" });
      return;
    }

    // sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError || !signUpData.user) {
      Swal.fire({ icon: "error", title: "สมัครสมาชิกล้มเหลว", text: signUpError?.message || "เกิดข้อผิดพลาด" });
      return;
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${username[0].toUpperCase()}&background=8b5cf6&color=fff`;
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([{ id: signUpData.user.id, username, avatar_url: avatarUrl }]);

    if (insertError) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: insertError.message });
      return;
    }

    // success message
    Swal.fire({
      icon: "success",
      title: "สมัครสมาชิกสำเร็จ 🎉",
      html: "โปรดยืนยันอีเมลก่อนเข้าสู่ระบบ",
    }).then(() => router.push("/LoginPage"));
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">สมัครสมาชิก</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้ของคุณ"
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600 placeholder-gray-400"
            />
          </div>

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

          <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่านของคุณ"
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10 text-gray-600 placeholder-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-gray-500 text-sm mb-2">
            <p>รหัสผ่านต้องมี :</p>
            <ul className="list-disc list-inside">
              {passwordRequirements.map((req) => <li key={req}>{req}</li>)}
            </ul>
          </div>

          <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors">
            สมัครสมาชิก
          </button>
        </form>
      </main>
    </div>
  );
};

export default SignupPage;
