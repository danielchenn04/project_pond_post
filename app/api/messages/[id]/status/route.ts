import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ['Floating', 'Docked', 'Hearted'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify ownership
  const { data: message } = await supabase
    .from('messages')
    .select('id, recipient_user_id')
    .eq('id', id)
    .single();

  if (!message || message.recipient_user_id !== auth.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await supabase.from('messages').update({ status }).eq('id', id);

  if (status === 'Docked') {
    await supabase.from('audit_log').insert({
      pond_id: auth.activePondId,
      actor_id: auth.userId,
      actor_role: auth.role,
      action: 'READ_MESSAGE',
      target_id: id,
      succeeded: true,
    });
  }

  return NextResponse.json({ success: true });
}
