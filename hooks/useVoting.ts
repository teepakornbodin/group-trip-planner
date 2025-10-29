// hooks/useVoting.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Vote {
  id: string;
  recommendation_id: string;           // UUID ของ ai_recommendations.id
  participant_nickname: string | null; // แสดงผลเท่านั้น ไม่ได้ใช้บังคับเอกลักษณ์
  vote_type: 'up' | 'down';
  voter_token?: string | null;         // ยังรับจาก API ได้ แต่เราไม่ใช้แล้ว
  participant_ip?: string | null;      // ยังรับจาก API ได้ แต่เราไม่ใช้แล้ว
  created_at?: string;
}

export function useVoting(tripCode?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ดึงผลโหวตทั้งหมดของทริป
   */
  const fetchVotes = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trips/${code}/votes`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch votes');

      const data = await response.json();
      if (data?.success) {
        setVotes(data.votes || []);
        return data.votes || [];
      }
      throw new Error(data?.error || 'Failed to fetch votes');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ส่งโหวต: ไม่ต้องมี token/IP/unique อะไรทั้งนั้น
   * ทุกครั้งจะ INSERT แถวใหม่เสมอ (ตามฝั่ง API ที่คุณแก้แล้ว)
   */
  const submitVote = useCallback(
    async (
      code: string,
      recommendationId: string,
      participantNickname: string | null, // ถ้า null จะใส่ "นิรนาม"
      voteType: 'up' | 'down'
    ) => {
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch(`/api/trips/${code}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendation_id: recommendationId,
            vote_type: voteType,
            participant_nickname: participantNickname ?? 'นิรนาม',
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to submit vote');
        }

        // refresh รายการโหวต
        await fetchVotes(code);
        return data.vote;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchVotes]
  );

  useEffect(() => {
    if (tripCode) fetchVotes(tripCode);
  }, [tripCode, fetchVotes]);

  return {
    votes,
    loading,
    submitting,
    error,
    submitVote,
    refetch: () => (tripCode ? fetchVotes(tripCode) : Promise.resolve([])),
  };
}
