import { NextRequest, NextResponse } from 'next/server';
import { getTripByCode } from '../../tripService';

export async function GET(
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

    const { data, error } = await getTripByCode(tripCode);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trip: data
    });

  } catch (error: any) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}