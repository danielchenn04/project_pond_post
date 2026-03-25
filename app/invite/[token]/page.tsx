'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TokenInfo {
  valid: boolean;
  linkType?: string;
  pondId?: string;
  error?: string;
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [info, setInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      const res = await fetch(`/api/invite/${token}`);
      const data = await res.json();
      setInfo(data);
      setLoading(false);
    }
    checkToken();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#A2D2FF' }}>
        <div className="envelope-idle text-4xl" style={{ color: '#D4A373' }}>✉</div>
      </main>
    );
  }

  if (!info?.valid) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#A2D2FF' }}>
        <div className="max-w-md w-full mx-4 rounded-2xl p-10 text-center"
          style={{ backgroundColor: '#FCF9F2', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
          <div className="envelope-error text-4xl mb-4 inline-block" style={{ color: '#D4A373' }}>✉</div>
          <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: '#283618' }}>
            Link Expired or Used
          </h2>
          <p className="font-lato text-sm mb-6" style={{ color: '#4A5568' }}>
            This link has already been used or has expired. Please request a new one from the Pond Keeper.
          </p>
          <Link href="/" className="btn-primary px-6 py-2.5 rounded-lg font-lato font-semibold text-white text-sm"
            style={{ backgroundColor: '#606C38' }}>
            Back to Pond Post
          </Link>
        </div>
      </main>
    );
  }

  const roleLabel = info.linkType === 'keeper' ? 'Keeper' : 'Guardian';

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#A2D2FF' }}>
      <div className="max-w-md w-full mx-4 rounded-2xl p-10 text-center"
        style={{ backgroundColor: '#FCF9F2', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div className="envelope-bounce text-4xl mb-4 inline-block" style={{ color: '#D4A373' }}>✉</div>
        <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: '#283618' }}>
          You've been invited!
        </h2>
        <p className="font-lato text-sm mb-2" style={{ color: '#4A5568' }}>
          You've been invited to join as a <strong>{roleLabel}</strong>.
        </p>
        <p className="font-lato text-sm mb-8" style={{ color: '#4A5568' }}>
          Create an account or log in to accept this invitation.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/register?invite=${token}`}
            className="btn-primary w-full py-3 rounded-lg font-lato font-semibold text-white text-sm text-center block"
            style={{ backgroundColor: '#606C38' }}>
            Create Account & Join
          </Link>
          <Link
            href={`/login?invite=${token}`}
            className="w-full py-3 rounded-lg font-lato font-semibold text-sm text-center block"
            style={{ color: '#283618', border: '1.5px solid #606C38' }}>
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  );
}
