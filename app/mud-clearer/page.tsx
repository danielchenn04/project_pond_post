'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import PinModal from '@/components/PinModal';
import { getSessionKey, clearSessionKey } from '@/lib/crypto/session';
import { decryptMessage } from '@/lib/crypto/decrypt';

interface FlaggedMessage {
  id: string;
  guardian_encrypted_body: string;
  created_at: string;
  decryptedBody?: string;
  revealed?: boolean;
  revealing?: boolean;
}

interface UserInfo {
  id: string;
  pondNymName: string;
  pondNymIcon: string;
  activePondId: string;
  role: string;
}

export default function MudClearerPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [showPin, setShowPin] = useState(false);
  const [pendingReveal, setPendingReveal] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'error' } | null>(null);
  const [confirmBan, setConfirmBan] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/messages/flagged');
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages || []);
  }, []);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/users/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const me = await meRes.json();
      if (!['Guardian', 'Keeper'].includes(me.role)) { router.push('/dashboard'); return; }
      setUser(me);
      await loadMessages();
    }
    init();
  }, [router, loadMessages]);

  async function revealMessage(id: string) {
    // Always require PIN before revealing a flagged message
    setPendingReveal(id);
    setShowPin(true);
  }

  async function decryptAndReveal(id: string) {
    const key = getSessionKey();
    if (!key) {
      setToast({ msg: 'Could not unlock private key. Please try again.', type: 'error' });
      return;
    }

    setMessages(prev => prev.map(m => m.id === id ? { ...m, revealing: true } : m));
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    try {
      const body = await decryptMessage(msg.guardian_encrypted_body, key);
      clearSessionKey();
      setMessages(prev => prev.map(m => m.id === id ? { ...m, decryptedBody: body, revealing: false, revealed: true } : m));
    } catch {
      setToast({ msg: 'Could not decrypt. Wrong PIN or the key on this device does not match.', type: 'error' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, revealing: false } : m));
    }
  }

  async function handlePinUnlocked() {
    setShowPin(false);
    if (pendingReveal) {
      await decryptAndReveal(pendingReveal);
      setPendingReveal(null);
    }
  }

  async function resolveMessage(id: string, action: 'no_action' | 'ban_sender') {
    if (action === 'ban_sender') {
      setConfirmBan(id);
      return;
    }
    await doResolve(id, 'no_action');
  }

  async function doResolve(id: string, action: 'no_action' | 'ban_sender') {
    setResolving(id);
    const res = await fetch(`/api/messages/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionAction: action }),
    });
    setResolving(null);
    setConfirmBan(null);
    if (res.ok) {
      setToast({ msg: action === 'ban_sender' ? 'Sender banned. The Pond is safer.' : 'Flag cleared. No action taken.' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } else {
      setToast({ msg: 'Failed to resolve flag.', type: 'error' });
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <NavBar userAlias={user?.pondNymName} userEmoji={user?.pondNymIcon}
        activePondId={user?.activePondId} role={user?.role} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-playfair text-4xl font-bold mb-1" style={{ color: '#283618' }}>Mud-Clearer</h1>
        <p className="font-lato text-sm mb-8" style={{ color: '#4A5568' }}>
          Assigned flags: {messages.length}
        </p>

        {messages.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ backgroundColor: '#BDE0FE', border: '1px solid #A2D2FF' }}>
            <div className="envelope-sway text-4xl mb-3 inline-block" style={{ color: '#D4A373' }}>✉</div>
            <p className="font-lato text-sm font-semibold" style={{ color: '#4A5568' }}>
              No flags assigned. The Pond is clear.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id} className="rounded-xl p-5"
                style={{
                  backgroundColor: '#E8E8E8',
                  border: '1px solid #D4A373',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-lato text-xs font-semibold" style={{ color: '#4A5568' }}>
                    Flagged message · {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Obscured / revealed content */}
                <div
                  className={`rounded-lg p-4 mb-4 transition-all duration-1200 ${msg.revealed ? '' : 'silt-obscured'}`}
                  style={{ backgroundColor: '#FCF9F2', minHeight: 80 }}
                >
                  {msg.revealed && msg.decryptedBody ? (
                    <p className="font-lora text-base leading-relaxed" style={{ color: '#2D3748' }}>
                      {msg.decryptedBody}
                    </p>
                  ) : (
                    <p className="font-lato text-sm" style={{ color: '#4A5568' }}>
                      {msg.revealing ? 'Decrypting…' : 'Message content hidden. Click to review.'}
                    </p>
                  )}
                </div>

                {!msg.revealed && (
                  <button onClick={() => revealMessage(msg.id)}
                    className="btn-secondary px-5 py-2 rounded-lg font-lato font-semibold text-sm mb-3"
                    style={{ backgroundColor: '#BDE0FE', color: '#2D3748' }}>
                    Click to Review
                  </button>
                )}

                {msg.revealed && (
                  <div className="flex gap-3 flex-col">
                    <div className="flex gap-3">
                      <button onClick={() => resolveMessage(msg.id, 'no_action')}
                        disabled={resolving === msg.id}
                        className="btn-primary flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
                        style={{ backgroundColor: '#606C38' }}>
                        Clear Water
                      </button>
                      <button onClick={() => resolveMessage(msg.id, 'ban_sender')}
                        disabled={resolving === msg.id}
                        className="btn-destructive flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
                        style={{ backgroundColor: '#BC6C25' }}>
                        Muddy Water
                      </button>
                    </div>
                    <p className="font-lato text-xs italic text-center" style={{ color: '#4A5568' }}>
                      Actions will be attributed to The Pond Post.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Ban confirmation modal */}
      <Modal open={!!confirmBan} destructive title="Ban this sender?">
        <p className="font-lato text-sm mb-6" style={{ color: '#4A5568' }}>
          The sender will be permanently banned from this Pond. This action is attributed to <strong>The Pond Post</strong> — your identity will not be revealed.
        </p>
        <div className="flex gap-3">
          <button onClick={() => confirmBan && doResolve(confirmBan, 'ban_sender')}
            disabled={!!resolving}
            className="btn-destructive flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm"
            style={{ backgroundColor: '#BC6C25' }}>
            {resolving ? 'Banning…' : 'Confirm Ban'}
          </button>
          <button onClick={() => setConfirmBan(null)}
            className="flex-1 py-2.5 rounded-lg font-lato font-semibold text-sm"
            style={{ color: '#4A5568', border: '1px solid #BDE0FE' }}>
            Cancel
          </button>
        </div>
      </Modal>

      <PinModal open={showPin} onUnlocked={handlePinUnlocked} onCancel={() => { setShowPin(false); setPendingReveal(null); }} />
      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
