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

  // Verify membership
  const { data: mapping } = await supabase
    .from('user_pond_mapping')
    .select('role')
    .eq('user_id', auth.userId)
    .eq('pond_id', pondId)
    .single();

  if (!mapping) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data: pond } = await supabase
    .from('ponds')
    .select('id, name, join_code, created_at')
    .eq('id', pondId)
    .single();

  if (!pond) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ pond });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (auth.role !== 'Keeper') {
    return NextResponse.json({ error: 'Keeper only' }, { status: 403 });
  }

  const { id: pondId } = await params;
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('ponds')
    .update({ name: name.trim() })
    .eq('id', pondId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (auth.role !== 'Keeper') {
    return NextResponse.json({ error: 'Keeper only' }, { status: 403 });
  }

  const { id: pondId } = await params;
  const supabase = createServerClient();

  // Check if sole keeper
  const { count } = await supabase
    .from('user_pond_mapping')
    .select('*', { count: 'exact', head: true })
    .eq('pond_id', pondId)
    .eq('role', 'Keeper')
    .eq('is_banned', false);

  if ((count || 0) > 1) {
    return NextResponse.json(
      { error: 'Cannot delete pond while other Keepers exist. Transfer Keeper role first.' },
      { status: 403 }
    );
  }

  // Get message count for warning display (already shown to client before this call)
  await supabase.from('audit_log').insert({
    pond_id: pondId,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'DELETE_POND',
    succeeded: true,
  });

  // CASCADE DELETE — Supabase ON DELETE CASCADE handles child tables
  const { error } = await supabase.from('ponds').delete().eq('id', pondId);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete pond' }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('pond_session', '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
