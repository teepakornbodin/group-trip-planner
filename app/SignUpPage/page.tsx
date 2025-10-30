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

    try {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username[0].toUpperCase())}&background=8b5cf6&color=fff`;
      
      // sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            avatar_url: avatarUrl,
          }
        }
      });

      if (signUpError) {
        // แปลข้อความ error
        let errorMessage = signUpError.message;
        
        if (errorMessage.includes("invalid")) {
          errorMessage = "อีเมลไม่ถูกต้อง กรุณาใช้อีเมลจริง เช่น yourname@gmail.com";
        } else if (errorMessage.includes("already registered")) {
          errorMessage = "อีเมลนี้ถูกใช้งานแล้ว";
        } else if (errorMessage.includes("weak password")) {
          errorMessage = "รหัสผ่านไม่ปลอดภัยเพียงพอ";
        }

        Swal.fire({ 
          icon: "error", 
          title: "สมัครสมาชิกล้มเหลว", 
          text: errorMessage 
        });
        return;
      }

      if (!signUpData.user) {
        throw new Error("ไม่สามารถสร้างบัญชีได้");
      }

      // รอให้ session พร้อมก่อนสร้าง profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // สร้าง profile ด้วย session ที่ login แล้ว
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // ถ้ายังไม่มี session ให้ login อัตโนมัติ
        await supabase.auth.signInWithPassword({ email, password });
      }

      const { error: insertError } = await supabase
        .from("profiles")
        .insert([{ 
          id: signUpData.user.id, 
          username, 
          avatar_url: avatarUrl 
        }]);

      if (insertError) {
        console.error("Profile insert error:", insertError);
        
        // ถ้ายังเกิด RLS error แสดงว่า Policy ยังไม่ถูกต้อง
        if (insertError.message.includes("row-level security")) {
          Swal.fire({ 
            icon: "error", 
            title: "กรุณาตั้งค่า RLS Policy", 
            html: `<div style="text-align: left;">
              <p>ไปที่ Supabase SQL Editor แล้ว run:</p>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
TO public
USING (true);
              </pre>
            </div>`,
            width: 600
          });
        } else {
          Swal.fire({ 
            icon: "error", 
            title: "เกิดข้อผิดพลาด", 
            text: insertError.message 
          });
        }
        return;
      }

      // success message
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ 🎉",
        html: `โปรดตรวจสอบอีเมล <strong>${email}</strong><br>เพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ`,
        confirmButtonColor: "#8b5cf6"
      }).then(() => router.push("/LoginPage"));

    } catch (error: any) {
      console.error("Signup error:", error);
      Swal.fire({ 
        icon: "error", 
        title: "สมัครสมาชิกล้มเหลว", 
        text: error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" 
      });
    }
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
              placeholder="example@gmail.com"
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600 placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">* กรุณาใช้อีเมลจริง เพื่อยืนยันบัญชี</p>
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
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว? <a href="/LoginPage" className="text-purple-600 hover:underline font-semibold">เข้าสู่ระบบ</a>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SignupPage;