import { NextRequest, NextResponse } from 'next/server';
import { validateInviteToken } from '@/lib/auth/invite';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const result = await validateInviteToken(token);

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    linkType: result.data?.link_type,
    pondId: result.data?.pond_id,
  });
}
