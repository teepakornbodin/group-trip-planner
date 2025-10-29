export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getVotes, submitVote } from '../../../../api/tripService';

// GET: รายการโหวตทั้งหมดของทริป
export async function GET(_req: NextRequest, { params }: { params: Promise<{ tripCode: string }> }) {
  try {
    const { tripCode } = await params;
    const { data, error } = await getVotes(tripCode);
    if (error) return NextResponse.json({ success: false, error }, { status: 400 });
    return NextResponse.json({ success: true, votes: data ?? [] });
  } catch (e: any) {
    console.error('Get votes API error:', e);
    return NextResponse.json({ success: false, error: e.message || 'Internal error' }, { status: 500 });
  }
}

// POST: บันทึกโหวต (นิรนามได้ / โหวตซ้ำได้)
// POST: บันทึกโหวต (อนุญาตนิรนาม, ไม่บังคับ token)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripCode: string }> }
) {
  try {
    const { tripCode } = await params;
    const body = await req.json();
    const { recommendation_id, vote_type, participant_nickname } = body;

    // ไม่บังคับ token/ip — ใครมาก็กดได้
    // optional: อ่าน forward IP เพื่อเก็บข้อมูล (ไม่ใช้เป็นการบล็อก)
    const fwd = req.headers.get('x-forwarded-for') || '';
    const realIp = fwd.split(',')[0]?.trim() || null;

    const { data, error } = await submitVote(
      tripCode,
      recommendation_id,
      participant_nickname ?? 'นิรนาม',
      vote_type,
      realIp // participantIP (optional)
      // ไม่ส่ง voterToken
    );

    if (error) {
      console.error('Insert vote error:', error);
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ success: true, vote: data });
  } catch (e: any) {
    console.error('Vote API error:', e);
    return NextResponse.json({ success: false, error: e.message || 'Internal error' }, { status: 500 });
  }
}