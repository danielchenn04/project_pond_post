import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pondNymName, pondNymIcon } = await req.json();
  if (!pondNymName || !pondNymIcon) {
    return NextResponse.json({ error: 'Missing nym fields' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check user doesn't already have a nym
  const { data: user } = await supabase
    .from('users')
    .select('pond_nym_name')
    .eq('id', auth.userId)
    .single();

  if (user?.pond_nym_name) {
    return NextResponse.json({ error: 'Pond-nym already assigned' }, { status: 409 });
  }

  const { error } = await supabase
    .from('users')
    .update({ pond_nym_name: pondNymName, pond_nym_icon: pondNymIcon })
    .eq('id', auth.userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to save nym' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
