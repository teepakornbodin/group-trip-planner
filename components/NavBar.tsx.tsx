"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
interface UserProfile {
  email?: string;
  username?: string;
  avatar_url?: string;
}

const NavBar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 💡 แก้ไข: สร้าง Client ที่ถูกต้อง
  const supabase = createClientComponentClient(); 

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      
      // ใช้ client ที่สร้างขึ้นใหม่
      const { data: { session } } = await supabase.auth.getSession(); 

      if (session?.user) {
        // fetch profile from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single();

        setUser({
          email: session.user.email || undefined,
          username: profile?.username || "User",
          avatar_url: profile?.avatar_url || "/default-avatar.png",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();

    // listen to auth state changes
    // ใช้ client ที่สร้างขึ้นใหม่
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { 
      fetchUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
    
    // 💡 เพิ่ม supabase ใน dependency array เพื่อให้ useEffect รู้จัก client ใหม่
  }, [supabase]); 
  
  // Note: ถ้าคุณไม่ชอบ Warning เรื่อง dependency array สามารถเอา [supabase] ออกได้ เนื่องจาก client จะถูกสร้างแค่ครั้งเดียว

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="bg-white px-4 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo_icon.png" alt="Logo" className="h-8 w-8 bg-purple-500 rounded-lg" />
          <span className="font-semibold text-gray-800">Group Trip Planner</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/" className={pathname === "/" ? "text-purple-500 font-bold" : "text-gray-600 hover:text-purple-500"}>หน้าแรก</Link>
          <Link href="/CreateTripPage" className={pathname === "/CreateTripPage" ? "text-purple-500 font-bold" : "text-gray-600 hover:text-purple-500"}>สร้างทริป</Link>
          <Link href="/MyTrip" className={pathname === "/MyTrip" ? "text-purple-500 font-bold" : "text-gray-600 hover:text-purple-500"}>ทริปของฉัน</Link>

          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
              <span className="text-gray-400">กำลังโหลด...</span>
            </div>
          ) : !user ? (
            <>
              <Link href="/LoginPage">
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">เข้าสู่ระบบ</button>
              </Link>
              <Link href="/SignUpPage">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">สมัครสมาชิก</button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-gray-700 font-medium">{user.username || user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
