import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.activePondId) return NextResponse.json({ error: 'No active pond' }, { status: 400 });

  const { recipientUserId, encryptedBody, blindToken } = await req.json();
  if (!recipientUserId || !encryptedBody || !blindToken) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check blind token uniqueness (replay prevention)
  const { data: usedToken } = await supabase
    .from('used_tokens')
    .select('token')
    .eq('token', blindToken)
    .single();

  if (usedToken) {
    return NextResponse.json({ error: 'Duplicate token — replay detected' }, { status: 409 });
  }

  // Store used token
  await supabase.from('used_tokens').insert({ token: blindToken });

  // Get sender mapping
  const { data: senderMapping } = await supabase
    .from('user_pond_mapping')
    .select('id, is_banned')
    .eq('user_id', auth.userId)
    .eq('pond_id', auth.activePondId)
    .single();

  if (!senderMapping) {
    return NextResponse.json({ error: 'Not a member of this pond' }, { status: 403 });
  }

  if (senderMapping.is_banned) {
    return NextResponse.json({ error: 'You are banned from this pond' }, { status: 403 });
  }

  // Verify recipient is in the pond
  const { data: recipientMapping } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('user_id', recipientUserId)
    .eq('pond_id', auth.activePondId)
    .single();

  if (!recipientMapping) {
    return NextResponse.json({ error: 'Recipient not in pond' }, { status: 400 });
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      pond_id: auth.activePondId,
      sender_mapping_id: senderMapping.id,
      recipient_user_id: recipientUserId,
      encrypted_body: encryptedBody,
      status: 'Floating',
    })
    .select('id')
    .single();

  if (error || !message) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    pond_id: auth.activePondId,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'SEND_MESSAGE',
    target_id: message.id,
    succeeded: true,
  });

  return NextResponse.json({ success: true, messageId: message.id });
}
