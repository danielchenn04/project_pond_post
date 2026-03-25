import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { signJwt } from '@/lib/auth/jwt';
import { markInviteTokenUsed } from '@/lib/auth/invite';
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
    const { email, password, publicKey, pondName, joinCode, inviteToken } = await req.json();

    if (!email || !password || !publicKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check email first
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Validate invite token or join code BEFORE creating the user
    let resolvedPondId: string | null = null;
    let role = 'Keeper';
    let inviteLinkId: string | null = null;

    if (inviteToken) {
      const { data: link, error: linkError } = await supabase
        .from('guardian_links')
        .select('id, pond_id, link_type, is_used, expires_at')
        .eq('token', inviteToken)
        .single();

      if (linkError || !link) {
        return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
      }
      if (link.is_used) {
        return NextResponse.json({ error: 'This invite link has already been used' }, { status: 409 });
      }
      if (new Date(link.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 });
      }

      resolvedPondId = link.pond_id;
      role = link.link_type === 'keeper' ? 'Keeper' : 'Guardian';
      inviteLinkId = link.id;
    } else if (joinCode) {
      const { data: pond } = await supabase
        .from('ponds')
        .select('id')
        .eq('join_code', joinCode)
        .single();

      if (!pond) {
        return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
      }

      resolvedPondId = pond.id;
      role = 'Inhabitant';
    }

    // All validation passed — now create the user
    const salt = crypto.randomBytes(16);
    const hash = await pbkdf2Hash(password, salt);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hash.toString('base64url'),
        salt: salt.toString('base64url'),
        public_key: publicKey,
      })
      .select('id, email')
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    let pondId: string;

    if (resolvedPondId) {
      // Join existing pond
      pondId = resolvedPondId;
      await supabase.from('user_pond_mapping').insert({
        user_id: user.id,
        pond_id: pondId,
        role,
      });
    } else {
      // Create new pond
      const { data: pond, error: pondError } = await supabase
        .from('ponds')
        .insert({ name: pondName || `${email.split('@')[0]}'s Pond` })
        .select('id')
        .single();

      if (pondError || !pond) {
        return NextResponse.json({ error: 'Failed to create pond' }, { status: 500 });
      }

      pondId = pond.id;
      await supabase.from('user_pond_mapping').insert({
        user_id: user.id,
        pond_id: pondId,
        role: 'Keeper',
      });
    }

    await supabase.from('audit_log').insert({
      pond_id: pondId,
      actor_id: user.id,
      actor_role: role,
      action: 'SIGN_UP',
      succeeded: true,
    });

    if (inviteLinkId) {
      await markInviteTokenUsed(inviteLinkId);
    }

    const token = await signJwt({
      userId: user.id,
      email: user.email,
      activePondId: pondId,
      role,
    });

    const res = NextResponse.json({ success: true, userId: user.id, pondId });
    res.cookies.set('pond_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
