import { NextApiRequest, NextApiResponse } from 'next';
import { createTrip } from '../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { data, error } = await createTrip(clientIP as string);

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(201).json({ 
      success: true, 
      trip: data,
      link: `${process.env.NEXT_PUBLIC_BASE_URL}/trip/${data.trip_code}`
    });
  } catch (error) {
    console.error('Error in create trip API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}