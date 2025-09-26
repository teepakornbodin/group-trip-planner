// pages/api/trips/[tripCode]/plan.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateTripPlan, getTripPlan } from '../../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  if (req.method === 'GET') {
    // Get existing plan
    try {
      const { data, error } = await getTripPlan(tripCode);

      if (error) {
        return res.status(404).json({ error });
      }

      return res.status(200).json({ success: true, plan: data });
    } catch (error) {
      console.error('Error in get trip plan API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Generate new plan
    try {
      const { data, error } = await generateTripPlan(tripCode);

      if (error) {
        return res.status(400).json({ error });
      }

      return res.status(201).json({ success: true, plan: data });
    } catch (error) {
      console.error('Error in generate trip plan API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}