"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NavBar = () => {
  const pathname = usePathname();
  return (
    <nav className="bg-white px-4 py-3 z-50 drop-shadow-sm drop-shadow-grey-200/20">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* ส่วนที่อยู่ชิดซ้าย: โลโก้และชื่อแอป */}
        <div className="flex items-center space-x-2">
          <Link href={"/"} className="flex items-center space-x-2">
            <img
              src="/logo_icon.png"
              alt="Logo"
              className="h-8 w-8 bg-purple-500 rounded-lg"
            />
            <span className="font-semibold text-gray-800">
              Group Trip Planner
            </span>
          </Link>
        </div>

        {/* ส่วนที่อยู่ชิดขวา: ลิงก์และปุ่ม Login */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className={`relative px-2 font-medium transition duration-300 ${
              pathname === "/"
                ? "text-white "
                : "text-gray-600 hover:text-purple-500"
            }`}
          >
            {pathname === "/" && (
              <span className="absolute inset-0 -z-10 flex items-center justify-center">
                <span className="px-8 py-4 rounded-full bg-purple-500"></span>
              </span>
            )}
            Home
          </Link>
          <Link
            href="/CreateTripPage"
            className={`relative px-2 font-medium transition duration-300 ${
              pathname === "/CreateTripPage"
                ? "text-white "
                : "text-gray-600 hover:text-purple-500"
            }`}
          >
            {pathname === "/CreateTripPage" && (
              <span className="absolute inset-0 -z-10 flex items-center justify-center">
                <span className="px-14 py-4 rounded-full bg-purple-500"></span>
              </span>
            )}
            Create Trip
          </Link>
          <Link
            href="/MyTrip"
            className={`relative px-2 font-medium transition duration-300 ${
              pathname === "/MyTrip"
                ? "text-white "
                : "text-gray-600 hover:text-purple-500"
            }`}
          >
            {pathname === "/MyTrip" && (
              <span className="absolute inset-0 -z-10 flex items-center justify-center">
                <span className="px-12 py-4 rounded-full bg-purple-500"></span>
              </span>
            )}
            My Trips
          </Link>
          <Link href="/LoginPage">
            <button className="ml-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300">
              Login
            </button>
          </Link>
          <Link href="/SignUpPage">
            <button className=" px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
