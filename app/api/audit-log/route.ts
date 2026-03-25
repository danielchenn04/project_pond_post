import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (auth.role !== 'Keeper') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const supabase = createServerClient();

  await supabase.from('audit_log').insert({
    pond_id: auth.activePondId,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'VIEW_AUDIT_LOG',
    succeeded: true,
  });

  const { data: logs, count, error } = await supabase
    .from('audit_log')
    .select(`
      id,
      action,
      actor_role,
      target_id,
      succeeded,
      created_at,
      actor_id
    `, { count: 'exact' })
    .eq('pond_id', auth.activePondId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }

  // Enrich with actor nym
  const enriched = await Promise.all(
    (logs || []).map(async (log) => {
      const { data: user } = await supabase
        .from('users')
        .select('pond_nym_name, pond_nym_icon')
        .eq('id', log.actor_id)
        .single();
      return {
        ...log,
        actorNym: user?.pond_nym_name || 'Unknown',
        actorIcon: user?.pond_nym_icon || '✉',
      };
    })
  );

  return NextResponse.json({
    logs: enriched,
    total: count || 0,
    page,
    pageSize,
  });
}
