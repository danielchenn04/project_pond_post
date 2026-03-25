import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';
import { signJwt } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Pond name required' }, { status: 400 });

  const supabase = createServerClient();

  const { data: pond, error } = await supabase
    .from('ponds')
    .insert({ name })
    .select('id, join_code')
    .single();

  if (error || !pond) {
    return NextResponse.json({ error: 'Failed to create pond' }, { status: 500 });
  }

  await supabase.from('user_pond_mapping').insert({
    user_id: auth.userId,
    pond_id: pond.id,
    role: 'Keeper',
  });

  await supabase.from('audit_log').insert({
    pond_id: pond.id,
    actor_id: auth.userId,
    actor_role: 'Keeper',
    action: 'CREATE_POND',
    succeeded: true,
  });

  // Reissue JWT with new activePondId
  const newToken = await signJwt({
    userId: auth.userId,
    email: auth.email,
    activePondId: pond.id,
    role: 'Keeper',
  });

  const res = NextResponse.json({ success: true, pondId: pond.id, joinCode: pond.join_code });
  res.cookies.set('pond_session', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });
  return res;
}
