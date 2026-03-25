import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { guardianEncryptedBody, guardianMappingId } = await req.json();

  if (!guardianEncryptedBody || !guardianMappingId) {
    return NextResponse.json({ error: 'Guardian encrypted body and guardian mapping required' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify message belongs to user
  const { data: message } = await supabase
    .from('messages')
    .select('id, recipient_user_id, pond_id, is_flagged')
    .eq('id', id)
    .single();

  if (!message || message.recipient_user_id !== auth.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (message.is_flagged) {
    return NextResponse.json({ error: 'Already flagged' }, { status: 409 });
  }

  // Validate the pre-selected guardian mapping belongs to this pond and is an active moderator
  const { data: assignedGuardian } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('id', guardianMappingId)
    .eq('pond_id', message.pond_id)
    .eq('is_banned', false)
    .in('role', ['Guardian', 'Keeper'])
    .single();

  if (!assignedGuardian) {
    return NextResponse.json({ error: 'Invalid guardian assignment' }, { status: 400 });
  }

  const { error } = await supabase
    .from('messages')
    .update({
      is_flagged: true,
      guardian_assigned_id: assignedGuardian.id,
      guardian_encrypted_body: guardianEncryptedBody,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to flag message' }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    pond_id: message.pond_id,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'FLAG_MESSAGE',
    target_id: id,
    succeeded: true,
  });

  return NextResponse.json({ success: true });
}
