import { NextApiRequest, NextApiResponse } from 'next';
import { getTripByCode } from '../../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  try {
    const { data, error } = await getTripByCode(tripCode);

    if (error) {
      return res.status(404).json({ error });
    }

    return res.status(200).json({ success: true, trip: data });
  } catch (error) {
    console.error('Error in get trip API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}