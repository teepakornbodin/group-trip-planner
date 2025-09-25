"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NavBar = () => {
  const pathname = usePathname();
  return (
    <nav className="bg-white px-4 py-3 z-50 drop-shadow-sm drop-shadow-grey-200/20">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href={"/"} className="flex items-center space-x-2">
            <Image
              src="/logo_icon.png"
              alt="Logo"
              className="h-8 w-8 bg-purple-500 rounded-lg"
            />
            <span className="font-semibold text-gray-800">
              Group Trip Planner
            </span>
          </Link>
          <div className="flex items-ceenter space-x-2 ml-2">
            <Link
              href="/"
              className={`relative px-2 font-medium transition duration-300 
              ${
                pathname === "/"
                  ? "text-white-600 font-semibold"
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
              className={`relative px-2 font-medium transition duration-300 
              ${
                pathname === "/CreateTripPage"
                  ? "text-white-600 font-semibold"
                  : "text-gray-600 hover:text-purple-500"
              }`}
            >
              {pathname === "/CreateTripPage" && (
                <span className="absolute inset-0 -z-10 flex items-center justify-center">
                  <span className="px-12 py-4 rounded-full bg-purple-500"></span>
                </span>
              )}
              CreateTrip
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
