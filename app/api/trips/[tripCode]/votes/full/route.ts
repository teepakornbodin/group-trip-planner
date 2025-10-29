// app/api/trips/[tripCode]/votes/full/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

type FullVoteOut = {
  id: string;
  recommendation_id: string;
  vote_type: 'up' | 'down';
  voter_token: string | null;
  participant_nickname: string | null;
  participant_ip: string | null;
  created_at: string | null;
  recommendation_name: string | null;
  recommendation_type: string | null;
  recommendation_location: string | null;
  estimated_cost: number | null;
  duration: string | null;
  rating: number | null;
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tripCode: string }> }
) {
  try {
    const { tripCode } = await ctx.params;

    const { data, error } = await supabase
      .from('recommendation_votes')
      .select(`
        id,
        recommendation_id,
        vote_type,
        voter_token,
        participant_nickname,
        participant_ip,
        created_at,
        ai:ai_recommendations!fk_votes_recommendation(
          name,
          type,
          location,
          estimated_cost,
          duration,
          rating
        ),
        t:trips!fk_votes_trip!inner(
          trip_code
        )
      `)
      .eq('t.trip_code', tripCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[votes/full] select error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const votes: FullVoteOut[] = (data ?? []).map((v: any) => ({
      id: v.id,
      recommendation_id: v.recommendation_id,
      vote_type: v.vote_type,
      voter_token: v.voter_token ?? null,
      participant_nickname: v.participant_nickname ?? null,
      participant_ip: v.participant_ip ?? null,
      created_at: v.created_at ?? null,
      recommendation_name: v.ai?.name ?? null,
      recommendation_type: v.ai?.type ?? null,
      recommendation_location: v.ai?.location ?? null,
      estimated_cost: v.ai?.estimated_cost ?? null,
      duration: v.ai?.duration ?? null,
      rating: v.ai?.rating != null ? Number(v.ai.rating) : null,
    }));

    return NextResponse.json({ success: true, votes }, { status: 200 });
  } catch (err: any) {
    console.error('[votes/full] fatal:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
