import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: mappings } = await supabase
    .from('user_pond_mapping')
    .select('pond_id, role, is_banned, ponds(id, name)')
    .eq('user_id', auth.userId)
    .eq('is_banned', false);

  if (!mappings) return NextResponse.json({ ponds: [] });

  // Get unread count per pond
  const pondData = await Promise.all(
    mappings.map(async (m) => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('pond_id', m.pond_id)
        .eq('recipient_user_id', auth.userId)
        .eq('status', 'Floating');

      const pond = m.ponds as unknown as { id: string; name: string } | null;
      return {
        id: m.pond_id,
        name: pond?.name || 'Unknown Pond',
        role: m.role,
        unread: count || 0,
      };
    })
  );

  return NextResponse.json({ ponds: pondData });
}
