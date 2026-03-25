import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messageId, reactionText } = await req.json();
  if (!messageId || !reactionText) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const validReactions = ["Thank you!", "This made my day!", "You're so kind!"];
  if (!validReactions.includes(reactionText)) {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get sender mapping
  const { data: senderMapping } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('pond_id', auth.activePondId)
    .single();

  if (!senderMapping) return NextResponse.json({ error: 'Not a pond member' }, { status: 403 });

  // Check no duplicate reaction
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('sender_mapping_id', senderMapping.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already reacted' }, { status: 409 });
  }

  const { error } = await supabase.from('reactions').insert({
    message_id: messageId,
    sender_mapping_id: senderMapping.id,
    reaction_text: reactionText,
  });

  if (error) return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 });

  return NextResponse.json({ success: true });
}
