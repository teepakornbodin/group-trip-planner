// pages/api/trips/[tripCode]/pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getTripPlan, deleteTripData } from '../../tripService';
import { generatePDF } from '../../../../utils/pdfGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tripCode } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof tripCode !== 'string') {
    return res.status(400).json({ error: 'Invalid trip code' });
  }

  try {
    // Get trip plan
    const { data: plan, error } = await getTripPlan(tripCode);

    if (error || !plan) {
      return res.status(404).json({ error: 'Trip plan not found' });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(plan);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trip-plan-${tripCode}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.status(200).send(pdfBuffer);

    // Delete trip data after successful download (async, don't wait)
    deleteTripData(tripCode).catch(console.error);

  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}