// pages/api/trips/[tripCode]/participants.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { addParticipant } from '../../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  try {
    const { nickname, available_dates, budget, preferred_province, travel_styles, additional_notes } = req.body;

    // Validation
    if (!nickname || !available_dates || !budget || !preferred_province || !travel_styles) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(available_dates) || available_dates.length === 0) {
      return res.status(400).json({ error: 'Available dates must be a non-empty array' });
    }

    if (!Array.isArray(travel_styles) || travel_styles.length === 0) {
      return res.status(400).json({ error: 'Travel styles must be a non-empty array' });
    }

    if (typeof budget !== 'number' || budget <= 0) {
      return res.status(400).json({ error: 'Budget must be a positive number' });
    }

    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const { data, error } = await addParticipant(
      tripCode,
      {
        nickname: nickname.trim(),
        available_dates,
        budget,
        preferred_province: preferred_province.trim(),
        travel_styles,
        additional_notes: additional_notes?.trim() || null
      },
      clientIP as string
    );

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(201).json({ success: true, participant: data });
  } catch (error) {
    console.error('Error in add participant API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}