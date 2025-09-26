'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Vote {
  id: string;
  recommendation_id: string;
  participant_nickname: string;
  vote_type: 'up' | 'down';
}

export function useVoting(tripCode?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/votes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch votes');
      }

      const data = await response.json();
      
      if (data.success) {
        setVotes(data.votes);
        return data.votes;
      } else {
        throw new Error(data.error || 'Failed to fetch votes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const submitVote = useCallback(async (
    code: string,
    recommendationId: string,
    participantNickname: string,
    voteType: 'up' | 'down'
  ) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${code}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          participant_nickname: participantNickname,
          vote_type: voteType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh votes after submitting
        await fetchVotes(code);
        return data;
      } else {
        throw new Error(data.error || 'Failed to submit vote');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchVotes]);

  useEffect(() => {
    if (tripCode) {
      fetchVotes(tripCode);
    }
  }, [tripCode, fetchVotes]);

  return {
    votes,
    loading,
    submitting,
    error,
    submitVote,
    refetch: () => tripCode && fetchVotes(tripCode)
  };
}