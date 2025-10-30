"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Trip {
  id: string;
  trip_name: string;
  created_at: string;
  description: string;
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
        .select("id, trip_name, created_at, description")
        .eq("creator_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTrips(data as Trip[]);
      }

      setLoading(false);
    };

    fetchMyTrips();
  }, []);

  if (loading) return <p className="text-center">กำลังโหลดทริป...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-purple-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
        ทริปของฉัน
      </h1>

      {trips.length === 0 ? (
        <p className="text-center text-gray-500">
          คุณยังไม่ได้สร้างทริปใด ๆ เลย
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <Link href={`/trip/${trip.id}`}>
                <h2 className="text-xl font-semibold text-purple-600 hover:underline">
                  {trip.trip_name}
                </h2>
              </Link>
              <p className="text-gray-500 mt-2">
                สร้างเมื่อ: {new Date(trip.created_at).toLocaleDateString()} <br />
                {trip.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;
