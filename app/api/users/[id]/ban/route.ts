import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!['Guardian', 'Keeper'].includes(auth.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: targetUserId } = await params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from('user_pond_mapping')
    .update({ is_banned: true })
    .eq('user_id', targetUserId)
    .eq('pond_id', auth.activePondId);

  if (error) {
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    pond_id: auth.activePondId,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'BAN_USER',
    target_id: targetUserId,
    succeeded: true,
  });

  return NextResponse.json({ success: true });
}
