'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadPrivateKey, hasWrappedKey } from '@/lib/crypto/session';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [envelopeClass, setEnvelopeClass] = useState('envelope-idle');

  function triggerError(msg: string) {
    setError(msg);
    setEnvelopeClass('envelope-error');
    setTimeout(() => setEnvelopeClass('envelope-idle'), 800);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'banned') {
          triggerError('Your account has been deactivated for violating Pond Post guidelines.');
        } else {
          triggerError(data.error || 'Login failed');
        }
        return;
      }

      // Unlock the private key with the PIN so it's ready for reading messages
      if (hasWrappedKey()) {
        try {
          await loadPrivateKey(pin);
        } catch {
          triggerError('Incorrect PIN. Your password was accepted but the PIN is wrong.');
          // Roll back the session cookie by logging out
          await fetch('/api/auth/logout', { method: 'POST' });
          return;
        }
      }

      if (inviteToken) {
        const redeemRes = await fetch(`/api/invite/${inviteToken}/redeem`, { method: 'POST' });
        if (!redeemRes.ok) {
          const redeemData = await redeemRes.json();
          triggerError(redeemData.error || 'Failed to redeem invite link.');
          await fetch('/api/auth/logout', { method: 'POST' });
          return;
        }
      }

      router.push(data.hasNym ? '/dashboard' : '/hatching');
    } catch {
      triggerError('A message got lost. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#A2D2FF' }}>
      <div className="relative w-full max-w-md mx-4 rounded-2xl p-10"
        style={{ backgroundColor: '#FCF9F2', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>

        <div className={`${envelopeClass} absolute top-5 right-5 text-2xl select-none`} style={{ color: '#D4A373' }}>✉</div>

        <h2 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Welcome back</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">
              Session PIN{' '}
              <span className="font-normal text-xs" style={{ color: '#4A5568' }}>ⓘ Required to read your messages.</span>
            </label>
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} required minLength={4}
              placeholder="Enter your PIN"
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          {error && <p className="font-lato text-sm" style={{ color: '#BC6C25' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50 mt-2"
            style={{ backgroundColor: '#606C38' }}>
            {loading ? 'Logging in…' : 'Return to the Pond'}
          </button>
        </form>

        <p className="font-lato text-sm text-center mt-4" style={{ color: '#4A5568' }}>
          New here?{' '}
          <Link href="/register" className="underline" style={{ color: '#606C38' }}>Start a Pond.</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
