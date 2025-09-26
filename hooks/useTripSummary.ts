// hooks/useTripSummary.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTripSummary(tripCode?: string) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
        return data.summary;
      } else {
        throw new Error(data.error || 'Failed to fetch summary');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tripCode) {
      fetchSummary(tripCode);
    }
  }, [tripCode, fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: () => tripCode && fetchSummary(tripCode)
  };
}

// hooks/useRecommendations.ts - Hook สำหรับ AI Recommendations
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AIRecommendation {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  estimated_cost: number;
  duration: string;
  rating: number;
  category: string;
  pros: string[];
  cons: string[];
  ai_confidence: number;
}

export function useRecommendations(tripCode?: string) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/recommendations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
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

  const generateRecommendations = useCallback(async (code: string) => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/recommendations`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
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
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (tripCode) {
      fetchRecommendations(tripCode);
    }
  }, [tripCode, fetchRecommendations]);

  return {
    recommendations,
    loading,
    generating,
    error,
    generateRecommendations,
    refetch: () => tripCode && fetchRecommendations(tripCode)
  };
}
