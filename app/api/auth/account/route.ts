import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  // Audit log before deletion
  if (auth.activePondId) {
    await supabase.from('audit_log').insert({
      pond_id: auth.activePondId,
      actor_id: auth.userId,
      actor_role: auth.role,
      action: 'DELETE_ACCOUNT',
      succeeded: true,
    });
  }

  // Soft delete: scrub email and password_hash, keep pond_nym
  const { error } = await supabase
    .from('users')
    .update({
      email: null,
      password_hash: null,
      salt: null,
      is_deleted: true,
    })
    .eq('id', auth.userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('pond_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return res;
}
