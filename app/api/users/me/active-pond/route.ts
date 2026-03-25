import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';
import { signJwt } from '@/lib/auth/jwt';

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pondId } = await req.json();
  if (!pondId) return NextResponse.json({ error: 'pondId required' }, { status: 400 });

  const supabase = createServerClient();

  // Verify user is a member of this pond
  const { data: mapping } = await supabase
    .from('user_pond_mapping')
    .select('role, is_banned')
    .eq('user_id', auth.userId)
    .eq('pond_id', pondId)
    .single();

  if (!mapping) return NextResponse.json({ error: 'Not a member of this pond' }, { status: 403 });
  if (mapping.is_banned) return NextResponse.json({ error: 'Banned from this pond' }, { status: 403 });

  // Re-issue JWT with new activePondId
  const newToken = await signJwt({
    userId: auth.userId,
    email: auth.email,
    activePondId: pondId,
    role: mapping.role,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set('pond_session', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });
  return res;
}
