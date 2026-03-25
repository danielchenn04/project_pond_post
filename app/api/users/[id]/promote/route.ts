import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ['Keeper']);
  if (!auth) return NextResponse.json({ error: 'Keeper only' }, { status: 403 });

  const { id: targetUserId } = await params;
  const { role } = await req.json();

  if (!['Guardian', 'Keeper'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from('user_pond_mapping')
    .update({ role })
    .eq('user_id', targetUserId)
    .eq('pond_id', auth.activePondId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('audit_log').insert({
    pond_id: auth.activePondId,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: role === 'Keeper' ? 'APPOINT_KEEPER' : 'APPOINT_GUARDIAN',
    target_id: targetUserId,
    succeeded: true,
  });

  return NextResponse.json({ success: true });
}
