import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { signJwt } from '@/lib/auth/jwt';
import crypto from 'crypto';

function pbkdf2Hash(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, salt, pond_nym_name, pond_nym_icon, is_deleted')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.is_deleted) {
      return NextResponse.json({ error: 'Account not found' }, { status: 401 });
    }

    // Verify password
    const salt = Buffer.from(user.salt, 'base64url');
    const hash = await pbkdf2Hash(password, salt);
    const hashB64 = hash.toString('base64url');

    if (hashB64 !== user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get active pond + check ban status
    const { data: mapping } = await supabase
      .from('user_pond_mapping')
      .select('pond_id, role, is_banned')
      .eq('user_id', user.id)
      .order('pond_id', { ascending: true })
      .limit(1)
      .single();

    if (mapping?.is_banned) {
      return NextResponse.json({ error: 'banned' }, { status: 403 });
    }

    const pondId = mapping?.pond_id;
    const role = mapping?.role || 'Inhabitant';

    // Audit log
    if (pondId) {
      await supabase.from('audit_log').insert({
        pond_id: pondId,
        actor_id: user.id,
        actor_role: role,
        action: 'LOG_IN',
        succeeded: true,
      });
    }

    const token = await signJwt({
      userId: user.id,
      email: user.email,
      activePondId: pondId,
      role,
    });

    const res = NextResponse.json({
      success: true,
      hasNym: !!user.pond_nym_name,
      pondId,
    });
    res.cookies.set('pond_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
