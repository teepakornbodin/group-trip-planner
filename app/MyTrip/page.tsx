"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Trip {
  id: string;
  name: string;
  date: string;
}

const MyTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTrips = async () => {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setError("Please login to see your trips.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("trips")
        .select("id, name, date")
        .eq("owner_id", session.user.id)
        .order("date", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setTrips(data as Trip[]);
      }
      setLoading(false);
    };

    fetchMyTrips();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <h1 className="text-3xl text-purple-600 font-bold mb-6 text-center">
        My Trips
      </h1>

      {trips.length === 0 ? (
        <p className="text-center text-gray-500">
          You don't have any trips yet. Start planning one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <Link href={`/trip/${trip.id}`}>
                <h2 className="text-xl font-semibold text-purple-600 hover:underline">
                  {trip.name}
                </h2>
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
