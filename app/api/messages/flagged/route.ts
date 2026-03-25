import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!['Guardian', 'Keeper'].includes(auth.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createServerClient();

  // Get the user's mapping id for this pond
  const { data: myMapping } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('pond_id', auth.activePondId)
    .single();

  if (!myMapping) return NextResponse.json({ messages: [] });

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, guardian_encrypted_body, created_at, is_resolved')
    .eq('guardian_assigned_id', myMapping.id)
    .eq('is_flagged', true)
    .eq('is_resolved', false)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch flagged messages' }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [] });
}
