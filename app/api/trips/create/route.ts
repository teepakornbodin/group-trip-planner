import { NextResponse } from "next/server";
import { createTrip } from "../../tripService"; // service ของคุณ

export async function POST(req: Request) {
  const clientIP = req.headers.get('x-forwarded-for') || '';
  const { data, error } = await createTrip(clientIP);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    trip: data,
    link: `${process.env.NEXT_PUBLIC_BASE_URL}/trip/${data.trip_code}`
  });
}
