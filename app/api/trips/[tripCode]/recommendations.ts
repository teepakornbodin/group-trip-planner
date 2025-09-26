// pages/api/trips/[tripCode]/recommendations.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateAIRecommendations, getAIRecommendations } from '../../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  if (req.method === 'GET') {
    // Get existing recommendations
    try {
      const { data, error } = await getAIRecommendations(tripCode);

      if (error) {
        return res.status(400).json({ error });
      }

      return res.status(200).json({ success: true, recommendations: data });
    } catch (error) {
      console.error('Error in get recommendations API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Generate new recommendations
    try {
      const { data, error } = await generateAIRecommendations(tripCode);

      if (error) {
        return res.status(400).json({ error });
      }

      return res.status(201).json({ success: true, recommendations: data });
    } catch (error) {
      console.error('Error in generate recommendations API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}