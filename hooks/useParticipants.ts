//D:\group-trip-planner\hooks\useParticipants.ts


'use client';

import { useState, useCallback } from 'react';

export interface ParticipantData {
  nickname: string;
  available_dates: string[];
  budget: number;
  preferred_province: string;
  travel_styles: string[];
  additional_notes?: string;
}

export interface Participant extends ParticipantData {
  id: string;
  trip_id: string;
  created_at: string;
}

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = useCallback(async (tripCode: string, data: ParticipantData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${tripCode}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add participant');
      }

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Failed to add participant');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParticipants = useCallback(async (tripCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${tripCode}/participants`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }

      const result = await response.json();
      
      if (result.success) {
        setParticipants(result.participants);
        return result.participants;
      } else {
        throw new Error(result.error || 'Failed to fetch participants');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    participants,
    addParticipant,
    fetchParticipants,
    loading,
    error
  };
}
