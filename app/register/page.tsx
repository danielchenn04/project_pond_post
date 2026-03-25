'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateKeyPair, exportPublicKey, wrapPrivateKey } from '@/lib/crypto/keypair';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const isJoining = searchParams.get('join') === 'true';
  const prefillCode = searchParams.get('code') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pin, setPin] = useState('');
  const [joinCode, setJoinCode] = useState(prefillCode);
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

    if (password !== confirm) return triggerError('Passwords do not match');
    if (password.length < 8) return triggerError('Password must be at least 8 characters');
    if (pin.length < 4) return triggerError('PIN must be at least 4 characters');

    setLoading(true);
    try {
      const keyPair = await generateKeyPair();
      const publicKeyB64 = await exportPublicKey(keyPair.publicKey);
      const wrappedPrivateKey = await wrapPrivateKey(keyPair.privateKey, pin);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          publicKey: publicKeyB64,
          inviteToken: inviteToken || undefined,
          joinCode: !inviteToken && isJoining ? joinCode : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) return triggerError(data.error || 'Registration failed');

      localStorage.setItem('pond_private_key_wrapped', wrappedPrivateKey);
      router.push('/hatching');
    } catch {
      triggerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#A2D2FF' }}>
      <div className="relative w-full max-w-md mx-4 rounded-2xl p-10" style={{ backgroundColor: '#FCF9F2', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div className={`${envelopeClass} absolute top-5 right-5 text-2xl select-none`} style={{ color: '#D4A373' }}>✉</div>

        <h2 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Create your account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <div>
            <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">
              Session PIN <span className="font-normal text-xs" style={{ color: '#4A5568' }}>ⓘ Protects your private key — keep it safe.</span>
            </label>
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} required minLength={4}
              placeholder="At least 4 characters"
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          {isJoining && (
            <div>
              <label className="font-lato text-sm font-semibold text-slate-dark block mb-1">Join Code</label>
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} required
                placeholder="Paste your Join Code" className="w-full px-3 py-2 font-lato text-sm rounded-lg font-mono"
                style={{ border: '1.5px solid #A2D2FF' }} />
            </div>
          )}
          {error && <p className="font-lato text-sm" style={{ color: '#BC6C25' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50 mt-2"
            style={{ backgroundColor: '#606C38' }}>
            {loading ? 'Creating account…' : 'Into the Pond'}
          </button>
        </form>

        <p className="font-lato text-sm text-center mt-4" style={{ color: '#4A5568' }}>
          Already have an account?{' '}
          <Link href="/login" className="underline" style={{ color: '#606C38' }}>Return to the Pond.</Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
