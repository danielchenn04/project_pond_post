'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Toast from '@/components/Toast';
import { encryptForRecipient } from '@/lib/crypto/encrypt';
import { generateBlindToken } from '@/lib/crypto/token';

interface DirectoryMember {
  userId: string;
  email: string;
  pondNymName: string;
  pondNymIcon: string;
  publicKey: string;
}

interface UserInfo {
  id: string;
  pondNymName: string;
  pondNymIcon: string;
  activePondId: string;
  role: string;
}

const STATIONERY = [
  { label: 'Parchment', bg: '#FCF9F2' },
  { label: 'Green', bg: '#d4e6c3' },
  { label: 'Classic', bg: '#FFFFFF' },
];

const MAX_CHARS = 500;

export default function ComposePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [directory, setDirectory] = useState<DirectoryMember[]>([]);
  const [filtered, setFiltered] = useState<DirectoryMember[]>([]);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipient, setRecipient] = useState<DirectoryMember | null>(null);
  const [message, setMessage] = useState('');
  const [stationery, setStationery] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [envelopeClass, setEnvelopeClass] = useState('envelope-idle');
  const [toast, setToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/users/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const me = await meRes.json();
      setUser(me);

      if (me.activePondId) {
        const dirRes = await fetch(`/api/ponds/${me.activePondId}/directory`);
        const dirData = await dirRes.json();
        setDirectory(dirData.directory || []);
        setFiltered(dirData.directory || []);
      }
    }
    load();
  }, [router]);

  // Filter directory on search
  useEffect(() => {
    if (!recipientQuery) {
      setFiltered(directory);
    } else {
      setFiltered(directory.filter(m =>
        m.email.toLowerCase().includes(recipientQuery.toLowerCase())
      ));
    }
  }, [recipientQuery, directory]);

  // Bounce envelope while typing
  useEffect(() => {
    if (message.length > 0) {
      setEnvelopeClass('envelope-bounce');
    } else {
      setEnvelopeClass('envelope-idle');
    }
  }, [message]);

  const canSend = recipient !== null && message.trim().length > 0 && !sending;

  async function handleSend() {
    if (!canSend || !recipient) return;
    setSending(true);

    try {
      const encryptedBody = await encryptForRecipient(message, recipient.publicKey);
      const blindToken = await generateBlindToken();

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: recipient.userId,
          encryptedBody,
          blindToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setToast(data.error || 'Failed to send');
        return;
      }

      setEnvelopeClass('envelope-sent');
      setTimeout(() => {
        setToast('Message sent!');
        setMessage('');
        setRecipient(null);
        setRecipientQuery('');
        setEnvelopeClass('envelope-idle');
        setSending(false);
      }, 700);
    } catch {
      setToast('Something went wrong. Please try again.');
      setSending(false);
    }
  }

  const stationeryBg = STATIONERY[stationery].bg;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <NavBar
        userAlias={user?.pondNymName}
        userEmoji={user?.pondNymIcon}
        activePondId={user?.activePondId}
        role={user?.role}
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-8 relative" style={{ backgroundColor: stationeryBg, border: '1px solid #D4A373', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Send a kind word</h2>

          {/* Recipient selector */}
          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="font-lato text-sm font-semibold block mb-1" style={{ color: '#2D3748' }}>To:</label>
            {recipient ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: '1.5px solid #606C38', backgroundColor: '#FAFAFA' }}>
                <span className="font-lato text-sm">{recipient.email}</span>
                <button onClick={() => { setRecipient(null); setRecipientQuery(''); }}
                  className="ml-auto text-guardian-slate hover:text-wax-red text-lg leading-none">×</button>
              </div>
            ) : (
              <input
                type="text"
                value={recipientQuery}
                onChange={e => { setRecipientQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search by email…"
                className="w-full px-3 py-2 font-lato text-sm rounded-lg"
                style={{ border: '1.5px solid #A2D2FF' }}
              />
            )}
            {dropdownOpen && !recipient && filtered.length > 0 && (
              <div className="dropdown-enter absolute left-0 right-0 top-full mt-1 z-10 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                style={{ backgroundColor: '#FAFAFA', border: '1px solid #A2D2FF' }}>
                {filtered.map(m => (
                  <button key={m.userId}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-sky-blue transition-colors font-lato text-sm"
                    onClick={() => { setRecipient(m); setDropdownOpen(false); }}>
                    <span className="font-mono">{m.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stationery toggle */}
          <div className="flex gap-2 mb-4">
            {STATIONERY.map((s, i) => (
              <button key={s.label} onClick={() => setStationery(i)}
                className="font-lato text-xs px-3 py-1.5 rounded-md transition-all"
                style={{
                  backgroundColor: s.bg,
                  border: stationery === i ? '2px solid #606C38' : '1.5px solid #BDE0FE',
                  color: '#2D3748',
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Message textarea */}
          <div className="relative mb-4">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Send a kind word into the Pond…"
              rows={6}
              className="w-full px-4 py-3 font-lato text-sm rounded-xl resize-none"
              style={{
                border: '2px solid #A2D2FF',
                background: 'rgba(162, 210, 255, 0.15)',
                minHeight: 160,
              }}
            />
            <span className="absolute bottom-3 right-3 font-lato text-xs" style={{ color: '#4A5568' }}>
              {message.length}/{MAX_CHARS}
            </span>
          </div>

          {/* Envelope icon + Send button */}
          <div className="flex items-end justify-end gap-4 mt-2">
            <span className={`text-3xl ${envelopeClass}`} style={{ color: '#D4A373' }}>✉</span>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="btn-send flex items-center justify-center rounded-full font-lato font-bold text-white text-sm"
              style={{
                width: 56,
                height: 56,
                backgroundColor: '#BC6C25',
                opacity: canSend ? 1 : 0.5,
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
