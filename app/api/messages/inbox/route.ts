import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.activePondId) return NextResponse.json({ messages: [] });

  const supabase = createServerClient();

  const url = new URL(req.url);
  const filter = url.searchParams.get('filter') || 'all'; // all | unread | favourites

  let query = supabase
    .from('messages')
    .select(`
      id,
      encrypted_body,
      status,
      is_flagged,
      created_at,
      sender_mapping_id,
      user_pond_mapping!sender_mapping_id(
        users(pond_nym_name, pond_nym_icon)
      )
    `)
    .eq('recipient_user_id', auth.userId)
    .eq('pond_id', auth.activePondId)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false });

  if (filter === 'unread') {
    query = query.eq('status', 'Floating');
  } else if (filter === 'favourites') {
    query = query.eq('status', 'Hearted');
  }

  const { data: messages, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [] });
}
