import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: pondId } = await params;
  const supabase = createServerClient();

  // Verify requester is a member
  const { data: myMapping } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('pond_id', pondId)
    .single();

  if (!myMapping) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  // Same round-robin logic as the flag endpoint
  const { data: guardians } = await supabase
    .from('user_pond_mapping')
    .select('id, user_id, users(public_key)')
    .eq('pond_id', pondId)
    .eq('role', 'Guardian')
    .eq('is_banned', false);

  const { data: keepers } = await supabase
    .from('user_pond_mapping')
    .select('id, user_id, users(public_key)')
    .eq('pond_id', pondId)
    .eq('role', 'Keeper')
    .eq('is_banned', false);

  const moderators = [...(guardians || []), ...(keepers || [])];

  if (moderators.length === 0) {
    return NextResponse.json({ error: 'No guardians available' }, { status: 503 });
  }

  const counts = await Promise.all(
    moderators.map(async (m) => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('guardian_assigned_id', m.id)
        .eq('is_resolved', false);
      return { ...m, flagCount: count || 0 };
    })
  );

  counts.sort((a, b) => a.flagCount - b.flagCount);
  const next = counts[0];
  const u = next.users as unknown as { public_key: string } | null;
  const publicKey = u?.public_key || '';

  if (!publicKey) {
    return NextResponse.json({ error: 'Assigned guardian has no public key on file' }, { status: 503 });
  }

  return NextResponse.json({
    guardianMappingId: next.id,
    publicKey,
  });
}
