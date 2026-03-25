'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import EnvelopeIcon from '@/components/EnvelopeIcon';
import PinModal from '@/components/PinModal';
import { getSessionKey, clearSessionKey } from '@/lib/crypto/session';
import { decryptMessage } from '@/lib/crypto/decrypt';
import { encryptForRecipient } from '@/lib/crypto/encrypt';
import { supabaseClient } from '@/lib/supabase/client';

interface RawMessage {
  id: string;
  encrypted_body: string;
  status: string;
  created_at: string;
  user_pond_mapping?: { users?: { pond_nym_name: string; pond_nym_icon: string } };
}

interface Message extends RawMessage {
  decryptedBody?: string;
}

interface UserInfo {
  id: string;
  pondNymName: string;
  pondNymIcon: string;
  activePondId: string;
  role: string;
}

const REACTIONS = ["Thank you!", "This made my day!", "You're so kind!"];

function NestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openId = searchParams.get('open');

  const [user, setUser] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'favourites'>('all');
  const [openMessage, setOpenMessage] = useState<Message | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pendingOpen, setPendingOpen] = useState<Message | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'error' } | null>(null);
  const [envelopeState, setEnvelopeState] = useState<'idle' | 'new-mail' | 'sway'>('idle');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagging, setFlagging] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/messages/inbox?filter=${filter}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages || []);
    if ((data.messages || []).length === 0) setEnvelopeState('sway');
    else setEnvelopeState('idle');
  }, [filter]);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/users/me');
      if (!meRes.ok) { router.push('/login'); return; }
      setUser(await meRes.json());
      await loadMessages();
    }
    init();
  }, [router, loadMessages]);

  // Auto-open if ?open= param
  useEffect(() => {
    if (openId && messages.length > 0) {
      const msg = messages.find(m => m.id === openId);
      if (msg) openMsg(msg);
    }
  }, [openId, messages]); // eslint-disable-line

  // Real-time
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabaseClient.channel('nest')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `recipient_user_id=eq.${user.id}` }, () => {
        setEnvelopeState('new-mail');
        setTimeout(() => setEnvelopeState('idle'), 1000);
        loadMessages();
      }).subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [user, loadMessages]);

  async function openMsg(msg: Message) {
    // Always require PIN for every message — prevents idle-computer snooping
    setPendingOpen(msg);
    setShowPin(true);
  }

  async function decryptAndOpen(msg: Message) {
    setDecrypting(true);
    const key = getSessionKey();
    if (!key) {
      setToast({ msg: 'Could not unlock private key. Please try again.', type: 'error' });
      setDecrypting(false);
      return;
    }
    try {
      const body = await decryptMessage(msg.encrypted_body, key);
      const decrypted = { ...msg, decryptedBody: body };
      setOpenMessage(decrypted);
      // Clear key from memory immediately after use — next message requires PIN again
      clearSessionKey();
      // Mark as read
      if (msg.status === 'Floating') {
        await fetch(`/api/messages/${msg.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Docked' }),
        });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'Docked' } : m));
      }
    } catch {
      setToast({ msg: 'Could not decrypt. If your PIN is correct, your keys may be out of sync — go to Settings → Re-sync Encryption Keys.', type: 'error' });
    }
    setDecrypting(false);
  }

  async function handlePinUnlocked() {
    setShowPin(false);
    if (pendingOpen) {
      await decryptAndOpen(pendingOpen);
      setPendingOpen(null);
    }
  }

  async function toggleFavourite(msg: Message) {
    const newStatus = msg.status === 'Hearted' ? 'Docked' : 'Hearted';
    await fetch(`/api/messages/${msg.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (openMessage?.id === msg.id) setOpenMessage({ ...openMessage, status: newStatus });
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: newStatus } : m));
  }

  async function sendReaction(text: string) {
    if (!openMessage) return;
    const res = await fetch('/api/reactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: openMessage.id, reactionText: text }),
    });
    setToast(res.ok ? { msg: 'Reaction sent!' } : { msg: 'Could not send reaction', type: 'error' });
  }

  async function confirmFlag() {
    if (!openMessage || !user) return;
    setFlagging(true);
    try {
      // Ask the server who will be assigned — encrypt for that specific guardian
      const nextRes = await fetch(`/api/ponds/${user.activePondId}/next-guardian`);
      if (!nextRes.ok) {
        setToast({ msg: 'No Guardians available right now. Please try again later.', type: 'error' });
        setFlagging(false); setShowFlagModal(false); return;
      }
      const { guardianMappingId, publicKey: guardianPublicKey } = await nextRes.json();

      const plaintext = openMessage.decryptedBody || '';
      const guardianEncryptedBody = await encryptForRecipient(plaintext, guardianPublicKey);

      const res = await fetch(`/api/messages/${openMessage.id}/flag`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardianEncryptedBody, guardianMappingId }),
      });

      if (res.ok) {
        setToast({ msg: 'Message flagged for review.' });
        setOpenMessage(null);
        setShowFlagModal(false);
        await loadMessages();
      } else {
        const data = await res.json();
        setToast({ msg: data.error || 'Failed to flag', type: 'error' });
      }
    } catch {
      setToast({ msg: 'Something went wrong.', type: 'error' });
    }
    setFlagging(false);
  }

  const nym = openMessage?.user_pond_mapping as any;
  const senderNym = nym?.users?.pond_nym_name || 'Someone';
  const senderIcon = nym?.users?.pond_nym_icon || '✉';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <NavBar userAlias={user?.pondNymName} userEmoji={user?.pondNymIcon}
        activePondId={user?.activePondId} role={user?.role} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-playfair text-4xl font-bold" style={{ color: '#283618' }}>The Nest</h1>
          <EnvelopeIcon state={envelopeState} size={40} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-4 mb-6 border-b border-sky-blue pb-2">
          {(['all', 'unread', 'favourites'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-lato text-sm capitalize pb-1 transition-colors"
              style={{
                color: filter === f ? '#606C38' : '#4A5568',
                borderBottom: filter === f ? '2px solid #606C38' : '2px solid transparent',
                fontWeight: filter === f ? 600 : 400,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Message list */}
        {messages.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ backgroundColor: '#FCF9F2', border: '1px solid #D4A373' }}>
            <div className="envelope-sway text-4xl mb-3 inline-block" style={{ color: '#D4A373' }}>✉</div>
            <p className="font-lato text-sm" style={{ color: '#4A5568' }}>
              Your Nest is empty. The Pond awaits your first message.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map(msg => {
              const isUnread = msg.status === 'Floating';
              const isHearted = msg.status === 'Hearted';
              const m = msg.user_pond_mapping as any;
              return (
                <div key={msg.id}
                  className="card-hover text-left w-full p-4 rounded-xl cursor-pointer"
                  onClick={() => openMsg(msg)}
                  style={{
                    backgroundColor: '#FAFAFA', border: '1px solid #D4A373',
                    borderLeft: `4px solid ${isUnread ? '#BC6C25' : '#BDE0FE'}`,
                  }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m?.users?.pond_nym_icon || '✉'}</span>
                    <span className="font-playfair font-bold text-base" style={{ color: '#283618' }}>
                      {m?.users?.pond_nym_name || 'Someone'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavourite(msg); }}
                      title={isHearted ? 'Unfavourite' : 'Favourite'}
                      className="ml-auto"
                      style={{ color: isHearted ? '#BC6C25' : '#CBD5E0', fontSize: 18 }}>
                      {isHearted ? '♥' : '♡'}
                    </button>
                    <span className="font-lato text-xs" style={{ color: '#4A5568' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-lato text-sm mt-1" style={{ color: '#4A5568' }}>
                    {isUnread ? 'New message' : 'Message'} · click to read
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Message reader modal */}
      {openMessage && (
        <Modal open={!!openMessage} onClose={() => setOpenMessage(null)}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-lato text-xs" style={{ color: '#4A5568' }}>
              {new Date(openMessage.created_at).toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button onClick={() => toggleFavourite(openMessage)}
                title={openMessage.status === 'Hearted' ? 'Unfavourite' : 'Favourite'}
                style={{ color: openMessage.status === 'Hearted' ? '#BC6C25' : '#4A5568', fontSize: 18 }}>
                {openMessage.status === 'Hearted' ? '♥' : '♡'}
              </button>
              <button onClick={() => setShowFlagModal(true)}
                className="font-lato text-xs px-2 py-1 rounded"
                style={{ color: '#BC6C25', border: '1px solid #BC6C25' }}>
                Flag
              </button>
            </div>
          </div>

          <div className="rounded-xl p-6 mb-5" style={{ backgroundColor: '#FCF9F2', minHeight: 120 }}>
            {decrypting ? (
              <p className="font-lato text-sm text-guardian-slate">Decrypting…</p>
            ) : (
              <p className="font-lora text-base leading-relaxed" style={{ color: '#2D3748' }}>
                {openMessage.decryptedBody}
              </p>
            )}
          </div>

          <p className="font-playfair text-sm mb-4" style={{ color: '#4A5568' }}>
            A message from {senderIcon} {senderNym}
          </p>

          {/* Reaction bar */}
          <div className="flex flex-wrap gap-2">
            {REACTIONS.map(r => (
              <button key={r} onClick={() => sendReaction(r)}
                className="font-lato text-sm px-3 py-1.5 rounded-lg transition-all"
                style={{ backgroundColor: '#BDE0FE', color: '#2D3748', border: '1.5px solid transparent' }}>
                {r}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Flag confirmation modal */}
      <Modal open={showFlagModal} onClose={() => setShowFlagModal(false)} destructive title="Flag this message?">
        <p className="font-lato text-sm mb-6" style={{ color: '#4A5568' }}>
          This will remove the message from your Nest and send it for Guardian review. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={confirmFlag} disabled={flagging}
            className="btn-destructive flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#BC6C25' }}>
            {flagging ? 'Flagging…' : 'Confirm Flag'}
          </button>
          <button onClick={() => setShowFlagModal(false)}
            className="flex-1 py-2.5 rounded-lg font-lato font-semibold text-sm"
            style={{ color: '#4A5568', border: '1px solid #BDE0FE' }}>
            Cancel
          </button>
        </div>
      </Modal>

      <PinModal open={showPin} onUnlocked={handlePinUnlocked} onCancel={() => { setShowPin(false); setPendingOpen(null); }} />
      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export default function NestPage() {
  return <Suspense><NestContent /></Suspense>;
}
