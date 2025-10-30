// hooks/useTripSummary.ts

'use client';

import { useState, useCallback } from 'react';

export function useTripSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (code: string) => {
    // เหมือนเดิม แต่ไม่ auto-fetch
    // ต้องเรียก fetchSummary(code) เอง
  }, []);

  return {
    summary,
    loading,
    error,
    fetchSummary // ใช้ตัวนี้แทน refetch
  };
}