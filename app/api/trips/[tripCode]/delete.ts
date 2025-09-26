// pages/api/trips/[tripCode]/delete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteTripData } from '../../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  try {
    const { success, error } = await deleteTripData(tripCode);

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, message: 'Trip data deleted successfully' });
  } catch (error) {
    console.error('Error in delete trip API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
