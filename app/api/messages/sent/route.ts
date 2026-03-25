import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: mapping } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('pond_id', auth.activePondId)
    .single();

  if (!mapping) return NextResponse.json({ messages: [] });

  const { data: messages } = await supabase
    .from('messages')
    .select('id, created_at, status, reactions(reaction_text)')
    .eq('sender_mapping_id', mapping.id)
    .eq('pond_id', auth.activePondId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ messages: messages || [] });
}
