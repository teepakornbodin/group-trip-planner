"use client";
import React from "react";

const NavBar = () => {
  return (
    <nav className="bg-white px-4 py-3 shadow-xl">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo_icon.png" alt="Logo" className="h-8 w-8 bg-purple-500 rounded-lg" />
          <span className="font-semibold text-gray-800">Group Trip Planner</span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
