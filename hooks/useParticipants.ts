//D:\group-trip-planner\hooks\useParticipants.ts
'use client';

import { useState, useCallback } from 'react';

export interface ParticipantData {
  id?: string; // optional id ถ้ามีจาก backend
  nickname: string;
  available_dates: string[];
  budget: number;
  preferred_province: string;
  travel_styles: string[];
  additional_notes?: string;
}

export function useParticipants() {
  const [participants, setParticipants] = useState<ParticipantData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึง participants จาก API
  const fetchParticipants = useCallback(async (tripCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripCode}/participants`);

      if (!response.ok) {
        // พยายามอ่านข้อความ error จาก body ถ้ามี
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const list: ParticipantData[] = data.participants || [];
      setParticipants(list);
      return list;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ฟังก์ชันเพิ่ม participant
  const addParticipant = useCallback(async (tripCode: string, payload: ParticipantData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripCode}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // ถ้า API ส่ง participant กลับมา ให้เพิ่มเข้า state เลย
        const newParticipant: ParticipantData = result.participant;
        setParticipants(prev => (prev ? [...prev, newParticipant] : [newParticipant]));
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

  return { participants, loading, error, fetchParticipants, addParticipant };
}
