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

  const { id } = await params;
  const { resolutionAction } = await req.json(); // 'no_action' | 'ban_sender'

  if (!['no_action', 'ban_sender'].includes(resolutionAction)) {
    return NextResponse.json({ error: 'Invalid resolution action' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: message } = await supabase
    .from('messages')
    .select('id, sender_mapping_id, pond_id')
    .eq('id', id)
    .eq('is_flagged', true)
    .single();

  if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await supabase
    .from('messages')
    .update({ is_resolved: true, resolution_action: resolutionAction })
    .eq('id', id);

  await supabase.from('audit_log').insert({
    pond_id: message.pond_id,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'RESOLVE_FLAG',
    target_id: id,
    succeeded: true,
  });

  if (resolutionAction === 'ban_sender' && message.sender_mapping_id) {
    // Get the sender's user_id
    const { data: senderMapping } = await supabase
      .from('user_pond_mapping')
      .select('user_id')
      .eq('id', message.sender_mapping_id)
      .single();

    if (senderMapping) {
      await supabase
        .from('user_pond_mapping')
        .update({ is_banned: true })
        .eq('id', message.sender_mapping_id);

      await supabase.from('audit_log').insert({
        pond_id: auth.activePondId,
        actor_id: auth.userId,
        actor_role: auth.role,
        action: 'BAN_USER',
        target_id: senderMapping.user_id,
        succeeded: true,
      });
    }
  }

  return NextResponse.json({ success: true });
}
