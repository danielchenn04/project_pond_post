import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';
import { markInviteTokenUsed } from '@/lib/auth/invite';
import { signJwt } from '@/lib/auth/jwt';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await params;
  const supabase = createServerClient();

  const { data: link, error: linkError } = await supabase
    .from('guardian_links')
    .select('id, pond_id, link_type, is_used, expires_at')
    .eq('token', token)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
  }
  if (link.is_used) {
    return NextResponse.json({ error: 'This invite link has already been used' }, { status: 409 });
  }
  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 });
  }

  const role = link.link_type === 'keeper' ? 'Keeper' : 'Guardian';

  // Check if already a member — if so, just upgrade role
  const { data: existingMapping } = await supabase
    .from('user_pond_mapping')
    .select('id, role')
    .eq('user_id', auth.userId)
    .eq('pond_id', link.pond_id)
    .maybeSingle();

  const ROLE_RANK: Record<string, number> = { Inhabitant: 0, Guardian: 1, Keeper: 2 };
  if (existingMapping) {
    // Never downgrade — only upgrade
    if ((ROLE_RANK[role] ?? 0) <= (ROLE_RANK[existingMapping.role] ?? 0)) {
      return NextResponse.json({ error: 'Your current role is already equal or higher.' }, { status: 409 });
    }
    await supabase
      .from('user_pond_mapping')
      .update({ role })
      .eq('id', existingMapping.id);
  } else {
    await supabase.from('user_pond_mapping').insert({
      user_id: auth.userId,
      pond_id: link.pond_id,
      role,
    });
  }

  await markInviteTokenUsed(link.id);

  await supabase.from('audit_log').insert({
    pond_id: link.pond_id,
    actor_id: auth.userId,
    actor_role: role,
    action: 'APPOINT_GUARDIAN',
    succeeded: true,
  });

  // Re-issue JWT with new activePondId and role
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', auth.userId)
    .single();

  const newToken = await signJwt({
    userId: auth.userId,
    email: user?.email || auth.email,
    activePondId: link.pond_id,
    role,
  });

  const res = NextResponse.json({ success: true, pondId: link.pond_id, role });
  res.cookies.set('pond_session', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });
  return res;
}
