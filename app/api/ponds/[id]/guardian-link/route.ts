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

  const { data: link, error } = await supabase
    .from('guardian_links')
    .insert({
      pond_id: pondId,
      created_by: auth.userId,
      link_type: 'guardian',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('token')
    .single();

  if (error || !link) {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    pond_id: pondId,
    actor_id: auth.userId,
    actor_role: auth.role,
    action: 'APPOINT_GUARDIAN',
    succeeded: true,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.json({
    link: `${appUrl}/invite/${link.token}`,
    token: link.token,
  });
}
