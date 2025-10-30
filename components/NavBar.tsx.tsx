"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Menu, X, LogOut, User } from "lucide-react";

interface UserProfile {
  email?: string;
  username?: string;
  avatar_url?: string;
}

const NavBar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "หน้าแรก" },
    { href: "/CreateTripPage", label: "สร้างทริป" },
    { href: "/MyTrip", label: "ทริปของฉัน" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 flex-shrink-0"
            onClick={closeMobileMenu}
          >
            <img
              src="/logo_icon.png"
              alt="Logo"
              className="h-8 w-8 bg-purple-500 rounded-lg"
            />
            <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg hidden sm:block">
              Group Trip Planner
            </span>
            <span className="font-semibold text-gray-800 text-sm sm:hidden">
              GTP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  pathname === link.href
                    ? "text-purple-600 font-bold"
                    : "text-gray-600 hover:text-purple-500"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Desktop Auth Section */}
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
              </div>
            ) : !user ? (
              <div className="flex items-center space-x-3">
                <Link href="/LoginPage">
                  <button className="px-4 py-2 text-purple-600 font-medium hover:text-purple-700 transition-colors">
                    เข้าสู่ระบบ
                  </button>
                </Link>
                <Link href="/SignUpPage">
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium">
                    สมัครสมาชิก
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700 font-medium max-w-[120px] truncate">
                    {user.username || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 pb-4">
            {/* Navigation Links */}
            <div className="py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "bg-purple-50 text-purple-600 font-bold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="border-t border-gray-200 pt-4 px-4">
              {loading ? (
                <div className="flex items-center space-x-3 py-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
                  <span className="text-gray-400">กำลังโหลด...</span>
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <Link href="/LoginPage" onClick={closeMobileMenu}>
                    <button className="w-full px-4 py-3 text-purple-600 font-medium border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors">
                      เข้าสู่ระบบ
                    </button>
                  </Link>
                  <Link href="/SignUpPage" onClick={closeMobileMenu}>
                    <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium">
                      สมัครสมาชิก
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg">
                    <img
                      src={user.avatar_url || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-semibold truncate">
                        {user.username || "User"}
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;