"use client";
import React from 'react';
import { Link } from 'lucide-react';
import { useRouter } from "next/navigation";

const HomePage = () => {
    const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Hero Section */}
        <div className='flex flex-col md:flex-row justify-center items-center'>
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Your Travel Plan, Your Way
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plan your next adventure with friends and let everyone have a say! Our platform 
              allows you to share travel ideas, vote for your favorite destinations, and let AI 
              help you choose the perfect itinerary. With us, travel planning is easy, fun, and stress-free. 
              Discover, vote, and go!
            </p>
          </div>

          {/* Robot Illustration */}
          <div className="mb-12 flex justify-center"> 
            <div className="mx-auto ">
              <img src="/logo_GroupTripPlanner.png" alt="Robot Illustration" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <button onClick={() => router.push(`/CreateTripPage`)} className="inline-flex items-center space-x-3 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
            <span>Get started!</span>
            <Link className="w-5 h-5" />    
          </button>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-purple-600 text-xl">👥</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Plan Together</h3>
            <p className="text-gray-600 text-sm">Collaborate with friends to create the perfect trip</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-purple-600 text-xl">🗳️</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Vote & Decide</h3>
            <p className="text-gray-600 text-sm">Let everyone vote for their favorite destinations</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-purple-600 text-xl">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">AI Assistant</h3>
            <p className="text-gray-600 text-sm">Get smart recommendations based on group preferences</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;