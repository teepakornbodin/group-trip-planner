// app/api/trips/[tripCode]/participants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addParticipant, getParticipants } from '../../../tripService'; // เพิ่ม getParticipants

// เก็บ POST method เดิมไว้
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripCode: string }> }
) {
  try {
    // Await the params object
    const { tripCode } = await params;
    
    if (!tripCode) {
      return NextResponse.json(
        { success: false, error: 'Trip code is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nickname, available_dates, budget, preferred_province, travel_styles, additional_notes } = body;

    // Validation
    if (!nickname || !available_dates || !budget || !preferred_province || !travel_styles) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(available_dates) || available_dates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Available dates must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(travel_styles) || travel_styles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Travel styles must be a non-empty array' },
        { status: 400 }
      );
    }

    if (typeof budget !== 'number' || budget <= 0) {
      return NextResponse.json(
        { success: false, error: 'Budget must be a positive number' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || 'unknown';

    const participantData = {
      nickname: nickname.trim(),
      available_dates,
      budget,
      preferred_province: preferred_province.trim(),
      travel_styles,
      additional_notes: additional_notes?.trim() || ''
    };

    const { data, error } = await addParticipant(tripCode, participantData, ip);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      participant: data
    });

  } catch (error: any) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// เพิ่ม GET method ใหม่
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripCode: string }> }
) {
  try {
    const { tripCode } = await params;
    
    if (!tripCode) {
      return NextResponse.json(
        { success: false, error: 'Trip code is required' },
        { status: 400 }
      );
    }

    const { data, error } = await getParticipants(tripCode);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      participants: data || []
    });

  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
