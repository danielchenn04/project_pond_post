'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sampleThreeNyms, type PondNym } from '@/lib/pond-nyms';

export default function HatchingPage() {
  const router = useRouter();
  const [options, setOptions] = useState<PondNym[]>([]);
  const [selected, setSelected] = useState<PondNym | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [envelopeSent, setEnvelopeSent] = useState(false);

  useEffect(() => {
    setOptions(sampleThreeNyms());
  }, []);

  async function handleConfirm() {
    if (!selected || confirming) return;
    setConfirming(true);
    setEnvelopeSent(true);

    try {
      await fetch('/api/users/me/nym', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pondNymName: selected.name, pondNymIcon: selected.emoji }),
      });
    } catch { /* silently continue */ }

    setTimeout(() => router.push('/dashboard'), 800);
  }

  const envelopeClass = envelopeSent ? 'envelope-sent' : selected ? 'envelope-bounce' : 'envelope-fast-bounce';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#A2D2FF' }}>
      <h1 className="font-playfair text-4xl font-bold mb-2" style={{ color: '#283618' }}>The Hatching</h1>
      <p className="font-lato text-base mb-10 text-center" style={{ color: '#283618' }}>
        Choose your identity in the Pond.
      </p>

      {/* Three alias cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 justify-center">
        {options.map((nym) => {
          const isSelected = selected?.name === nym.name;
          const isDimmed = selected && !isSelected;
          return (
            <button
              key={nym.name}
              onClick={() => !confirming && setSelected(nym)}
              disabled={confirming}
              className="alias-card flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer"
              style={{
                width: 160,
                height: 160,
                backgroundColor: '#FCF9F2',
                border: isSelected ? '3px solid #606C38' : '2px solid #BDE0FE',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                opacity: isDimmed ? 0.4 : 1,
                transition: 'opacity 0.15s, border-color 0.15s, transform 0.2s',
              }}
            >
              <span style={{ fontSize: 48 }}>{nym.emoji}</span>
              <span className="font-playfair font-bold text-center px-2" style={{ fontSize: 16, color: '#283618' }}>
                {nym.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Envelope */}
      <div className="flex flex-col items-center gap-4">
        <div className={`text-5xl select-none ${envelopeClass}`} style={{ color: '#D4A373' }}>✉</div>

        {selected && (
          <p className="font-playfair font-bold text-center" style={{ fontSize: 22, color: '#283618' }}>
            You are {selected.name}!
          </p>
        )}

        {selected && !confirming && (
          <button
            onClick={handleConfirm}
            className="btn-primary px-10 py-3 rounded-lg font-lato font-semibold text-white text-base"
            style={{ backgroundColor: '#606C38' }}
          >
            Confirm
          </button>
        )}
      </div>
    </main>
  );
}
