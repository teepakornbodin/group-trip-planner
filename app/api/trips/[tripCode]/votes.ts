// pages/api/trips/[tripCode]/votes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { submitVote, getVotes } from '../../tripService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  if (req.method === 'GET') {
    // Get votes
    try {
      const { data, error } = await getVotes(tripCode);

      if (error) {
        return res.status(400).json({ error });
      }

      return res.status(200).json({ success: true, votes: data });
    } catch (error) {
      console.error('Error in get votes API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Submit vote
    try {
      const { recommendation_id, participant_nickname, vote_type } = req.body;

      if (!recommendation_id || !participant_nickname || !vote_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!['up', 'down'].includes(vote_type)) {
        return res.status(400).json({ error: 'Invalid vote type' });
      }

      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      const { data, error } = await submitVote(
        tripCode,
        recommendation_id,
        participant_nickname.trim(),
        vote_type,
        clientIP as string
      );

      if (error) {
        return res.status(400).json({ error });
      }

      return res.status(201).json({ success: true, vote: data });
    } catch (error) {
      console.error('Error in submit vote API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}