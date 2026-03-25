import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, pond_nym_name, pond_nym_icon, public_key, created_at')
    .eq('id', auth.userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { data: mapping } = await supabase
    .from('user_pond_mapping')
    .select('role, is_banned')
    .eq('user_id', auth.userId)
    .eq('pond_id', auth.activePondId)
    .single();

  return NextResponse.json({
    id: user.id,
    pondNymName: user.pond_nym_name,
    pondNymIcon: user.pond_nym_icon,
    publicKey: user.public_key,
    createdAt: user.created_at,
    activePondId: auth.activePondId,
    role: mapping?.role || auth.role,
    isBanned: mapping?.is_banned || false,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = createServerClient();

  const updates: Record<string, string> = {};
  if (body.email) updates.email = body.email;
  if (body.publicKey) updates.public_key = body.publicKey;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('users').update(updates).eq('id', auth.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
