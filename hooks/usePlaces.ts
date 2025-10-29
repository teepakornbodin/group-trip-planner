// hooks/usePlaces.ts (ไฟล์เดิมของคุณ ใช้ได้เลย)
'use client';

import { useState, useCallback } from 'react';

export interface PlaceRecommendation {
  id: string; // ✅ ตอนนี้จะเป็น UUID จาก DB
  name: string;
  type: string;
  description: string;
  rating: number;
  estimatedCost: number;
  duration: string;
  location: string;
  address: string;
  photos?: string[];
  pros: string[];
  cons: string[];
  place_id: string; // ใช้เปิด Google Maps
  category: string;
}

export function usePlaces() {
  const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = useCallback(async (tripCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/places/recommendations/${tripCode}`, { method: 'POST' });
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || 'Failed to generate recommendations');
      }
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        return data.recommendations;
      } else {
        throw new Error(data.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async (tripCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/places/recommendations/${tripCode}`);
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || 'Failed to fetch recommendations');
      }
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        return data.recommendations;
      } else {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { recommendations, loading, error, generateRecommendations, fetchRecommendations };
}
