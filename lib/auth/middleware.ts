import { NextRequest } from 'next/server';
import { verifyJwt, JwtPayload } from './jwt';

export async function requireAuth(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get('pond_session')?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<JwtPayload | null> {
  const payload = await requireAuth(req);
  if (!payload) return null;
  if (!allowedRoles.includes(payload.role || '')) return null;
  return payload;
}
