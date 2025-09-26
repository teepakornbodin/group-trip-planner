// app/mytrips/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const response = await fetch('/api/mytrips');
        if (!response.ok) {
          throw new Error('Failed to fetch trips');
        }
        const data = await response.json();
        setTrips(data.trips);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTrips();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 h-screen w-full  bg-gradient-to-br from-purple-50 to-purple-100">
      <h1 className="text-3xl text-purple-600 font-bold mb-6 text-center">My Trips</h1>
      {trips.length === 0 ? (
        <p className="text-center text-gray-500">You don't have any trips yet. Start planning one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <Link href={`/trip/${trip.id}`}>
                <h2 className="text-xl font-semibold text-purple-600 hover:underline">{trip.name}</h2>
              </Link>
              <p className="text-gray-500 mt-2">{trip.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;