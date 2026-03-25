import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
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

  // Generate new UUID join code by updating the record
  const { data: pond, error } = await supabase
    .rpc('reset_join_code', { pond_id_param: pondId });

  // Fallback: use a raw update with a new UUID
  if (error) {
    const { data: updated, error: updateError } = await supabase
      .from('ponds')
      .update({ join_code: crypto.randomUUID() })
      .eq('id', pondId)
      .select('join_code')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to reset join code' }, { status: 500 });
    }

    await supabase.from('audit_log').insert({
      pond_id: pondId,
      actor_id: auth.userId,
      actor_role: auth.role,
      action: 'RESET_JOIN_CODE',
      succeeded: true,
    });

    return NextResponse.json({ joinCode: updated.join_code });
  }

  return NextResponse.json({ joinCode: pond });
}
