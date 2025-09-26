// hooks/useTripPlan.ts - Hook สำหรับ Final Trip Plan
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TripPlan {
  id: string;
  plan_title: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  itinerary: any[];
  budget_breakdown: any;
  travel_tips: string[];
  overview: any;
}

export function useTripPlan(tripCode?: string) {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/plan`);
      
      if (!response.ok) {
        throw new Error('Plan not found');
      }

      const data = await response.json();
      
      if (data.success) {
        setPlan(data.plan);
        return data.plan;
      } else {
        throw new Error(data.error || 'Failed to fetch plan');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async (code: string) => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/plan`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      
      if (data.success) {
        setPlan(data.plan);
        return data.plan;
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback((code: string) => {
    const url = `/api/trips/${code}/pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip-plan-${code}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    if (tripCode) {
      fetchPlan(tripCode);
    }
  }, [tripCode, fetchPlan]);

  return {
    plan,
    loading,
    generating,
    error,
    generatePlan,
    downloadPDF,
    refetch: () => tripCode && fetchPlan(tripCode)
  };
}