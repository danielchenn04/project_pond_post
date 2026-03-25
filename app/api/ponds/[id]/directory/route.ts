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

  // Verify user is in this pond
  const supabase = createServerClient();
  const { data: myMapping } = await supabase
    .from('user_pond_mapping')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('pond_id', pondId)
    .single();

  if (!myMapping) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data: members } = await supabase
    .from('user_pond_mapping')
    .select('user_id, role, users(id, pond_nym_name, pond_nym_icon, public_key, email)')
    .eq('pond_id', pondId)
    .eq('is_banned', false);

  const directory = (members || [])
    .filter((m) => m.user_id !== auth.userId) // exclude self
    .map((m) => {
      const u = m.users as unknown as { id: string; pond_nym_name: string; pond_nym_icon: string; public_key: string; email: string } | null;
      return {
        userId: m.user_id,
        email: u?.email || '',
        pondNymName: u?.pond_nym_name || 'Unknown',
        pondNymIcon: u?.pond_nym_icon || '✉',
        publicKey: u?.public_key || '',
      };
    });

  return NextResponse.json({ directory });
}
