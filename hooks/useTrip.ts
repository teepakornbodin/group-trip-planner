// hooks/useTrip.ts
'use client';

import { useState, useCallback } from 'react';

export interface TripData {
  id: string;
  trip_code: string;
  title?: string;
  status: string;
  created_at: string;
  expires_at: string;
  link?: string;
}

export function useTrip() {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // สร้างทริปใหม่
  const createTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      const data = await response.json();
      
      if (data.success) {
        // สร้าง link จาก trip_code และ origin ปัจจุบัน
        const tripLink = `${window.location.origin}/TripFormPage/${data.trip.trip_code}`;
        
        // เพิ่ม link เข้าไปใน trip data
        const tripWithLink = {
          ...data.trip,
          link: tripLink
        };
        
        setTrip(tripWithLink);
        
        return {
          success: true,
          trip: tripWithLink,
          link: tripLink
        };
      } else {
        throw new Error(data.error || 'Failed to create trip');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงข้อมูลทริป
  const fetchTrip = useCallback(async (tripCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${tripCode}`);
      
      if (!response.ok) {
        throw new Error('Trip not found');
      }

      const data = await response.json();
      
      if (data.success) {
        // สร้าง link สำหรับทริปที่ดึงมา
        const tripLink = `${window.location.origin}/TripFormPage/${data.trip.trip_code}`;
        
        const tripWithLink = {
          ...data.trip,
          link: tripLink
        };
        
        setTrip(tripWithLink);
        return tripWithLink;
      } else {
        throw new Error(data.error || 'Failed to fetch trip');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // รีเซ็ต state
  const resetTrip = useCallback(() => {
    setTrip(null);
    setError(null);
    setLoading(false);
  }, []);

  // Copy link to clipboard
  const copyLinkToClipboard = useCallback(async () => {
    if (!trip?.link) {
      throw new Error('No link available to copy');
    }

    try {
      await navigator.clipboard.writeText(trip.link);
      return true;
    } catch (err) {
      console.error('Failed to copy link:', err);
      throw new Error('Failed to copy link to clipboard');
    }
  }, [trip?.link]);

  return {
    trip,
    loading,
    error,
    createTrip,
    fetchTrip,
    resetTrip,
    copyLinkToClipboard,
    refetch: (tripCode: string) => fetchTrip(tripCode)
  };
}