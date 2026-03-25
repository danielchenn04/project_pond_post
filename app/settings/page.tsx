'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { generateKeyPair, exportPublicKey, wrapPrivateKey } from '@/lib/crypto/keypair';

interface UserInfo {
  id: string;
  pondNymName: string;
  pondNymIcon: string;
  activePondId: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'error' } | null>(null);
  const [showResyncModal, setShowResyncModal] = useState(false);
  const [resyncPin, setResyncPin] = useState('');
  const [resyncing, setResyncing] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/users/me');
      if (!res.ok) { router.push('/login'); return; }
      setUser(await res.json());
    }
    load();
  }, [router]);

  async function handleDeleteAccount() {
    setActing(true);
    const res = await fetch('/api/auth/account', { method: 'DELETE' });
    setActing(false);
    if (res.ok) {
      localStorage.removeItem('pond_private_key_wrapped');
      router.push('/');
    } else {
      setToast({ msg: 'Failed to delete account', type: 'error' });
    }
  }

  async function handleResyncKeys(e: React.FormEvent) {
    e.preventDefault();
    if (resyncPin.length < 4) return;
    setResyncing(true);
    try {
      const { publicKey, privateKey } = await generateKeyPair();
      const spki = await exportPublicKey(publicKey);
      const wrappedKey = await wrapPrivateKey(privateKey, resyncPin);

      // Update the server FIRST — only write to localStorage if the DB succeeds,
      // otherwise the private key and public key would be out of sync.
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: spki }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ msg: data.error || 'Failed to update public key on server. Keys were not changed.', type: 'error' });
        setResyncing(false);
        return;
      }

      // Verify the server actually stored the right key before touching localStorage
      const verifyRes = await fetch('/api/users/me');
      const verifyData = await verifyRes.json();
      if (verifyData.publicKey !== spki) {
        setToast({ msg: 'Server key verification failed — the DB did not update. Keys were not changed.', type: 'error' });
        setResyncing(false);
        return;
      }

      localStorage.setItem('pond_private_key_wrapped', wrappedKey);
      setToast({ msg: 'Keys re-synced. Use your same PIN to read new messages.' });
      setShowResyncModal(false);
      setResyncPin('');
    } catch {
      setToast({ msg: 'Key generation failed. Please try again.', type: 'error' });
    }
    setResyncing(false);
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setActing(true);
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail }),
    });
    setActing(false);
    if (res.ok) {
      setToast({ msg: 'Email updated.' });
      setShowChangeEmail(false);
      setNewEmail('');
    } else {
      setToast({ msg: 'Failed to update email', type: 'error' });
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <NavBar userAlias={user?.pondNymName} userEmoji={user?.pondNymIcon}
        activePondId={user?.activePondId} role={user?.role} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-playfair text-4xl font-bold mb-8" style={{ color: '#283618' }}>The Reeds</h1>

        {/* Profile card */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#FCF9F2', border: '1px solid #D4A373' }}>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 48 }}>{user?.pondNymIcon || '✉'}</span>
            <div>
              <p className="font-playfair font-bold text-2xl" style={{ color: '#283618' }}>{user?.pondNymName || '…'}</p>
              {user?.createdAt && (
                <p className="font-lato text-sm mt-1" style={{ color: '#4A5568' }}>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
              <p className="font-lato text-xs mt-0.5" style={{ color: '#606C38' }}>Role: {user?.role}</p>
            </div>
          </div>
        </div>

        {/* Encryption keys */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373' }}>
          <h2 className="font-lato font-semibold text-lg mb-1" style={{ color: '#606C38' }}>Encryption Keys</h2>
          <p className="font-lato text-xs mb-4" style={{ color: '#4A5568' }}>
            If your messages fail to decrypt, your local key may be out of sync with the server. Re-syncing generates a new keypair — old messages will become permanently unreadable.
          </p>
          <button onClick={() => setShowResyncModal(true)}
            className="btn-secondary w-full py-2.5 rounded-lg font-lato font-semibold text-sm"
            style={{ backgroundColor: '#BDE0FE', color: '#2D3748' }}>
            Re-sync Encryption Keys
          </button>
        </div>

        {/* Account management */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373' }}>
          <h2 className="font-lato font-semibold text-lg mb-4" style={{ color: '#606C38' }}>Account</h2>
          <div className="flex flex-col gap-3">
            <button onClick={() => setShowChangeEmail(true)}
              className="btn-secondary w-full py-2.5 rounded-lg font-lato font-semibold text-sm"
              style={{ backgroundColor: '#BDE0FE', color: '#2D3748' }}>
              Change Email
            </button>
            <button onClick={() => setShowDeleteModal(true)}
              className="btn-destructive w-full py-2.5 rounded-lg font-lato font-semibold text-white text-sm"
              style={{ backgroundColor: '#BC6C25' }}>
              Delete Account
            </button>
          </div>
        </div>
      </main>

      {/* Delete account modal */}
      <Modal open={showDeleteModal} destructive title="Delete your account?">
        <p className="font-lato text-sm mb-2" style={{ color: '#4A5568' }}>
          This will permanently remove your email and password. Your Pond-nym and received messages will remain for other members.
        </p>
        <p className="font-lato text-sm font-bold mb-6" style={{ color: '#BC6C25' }}>
          Your private key will be cleared from this device. Existing messages cannot be recovered.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDeleteAccount} disabled={acting}
            className="btn-destructive flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#BC6C25' }}>
            {acting ? 'Deleting…' : 'Delete Account'}
          </button>
          <button onClick={() => setShowDeleteModal(false)}
            className="flex-1 py-2.5 rounded-lg font-lato font-semibold text-sm"
            style={{ color: '#4A5568', border: '1px solid #BDE0FE' }}>
            Cancel
          </button>
        </div>
      </Modal>

      {/* Change email modal */}
      <Modal open={showChangeEmail} onClose={() => setShowChangeEmail(false)} title="Change Email">
        <form onSubmit={handleChangeEmail} className="flex flex-col gap-4">
          <div>
            <label className="font-lato text-sm font-semibold block mb-1" style={{ color: '#2D3748' }}>New Email</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <button type="submit" disabled={acting}
            className="btn-primary py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#606C38' }}>
            {acting ? 'Saving…' : 'Update Email'}
          </button>
        </form>
      </Modal>

      {/* Re-sync keys modal */}
      <Modal open={showResyncModal} destructive title="Re-sync Encryption Keys?">
        <p className="font-lato text-sm mb-2" style={{ color: '#4A5568' }}>
          This generates a brand-new keypair. Any messages currently in your Nest will become <strong>permanently unreadable</strong>. Your PIN stays the same.
        </p>
        <p className="font-lato text-sm mb-5" style={{ color: '#BC6C25', fontWeight: 600 }}>
          Only do this if your messages are failing to decrypt.
        </p>
        <form onSubmit={handleResyncKeys} className="flex flex-col gap-4">
          <div>
            <label className="font-lato text-sm font-semibold block mb-1" style={{ color: '#2D3748' }}>
              Your Session PIN <span className="font-normal text-xs" style={{ color: '#4A5568' }}>to confirm</span>
            </label>
            <input type="password" value={resyncPin} onChange={e => setResyncPin(e.target.value)}
              required minLength={4} placeholder="Enter your current PIN"
              className="w-full px-3 py-2 font-lato text-sm rounded-lg" style={{ border: '1.5px solid #A2D2FF' }} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={resyncing || resyncPin.length < 4}
              className="btn-destructive flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
              style={{ backgroundColor: '#BC6C25' }}>
              {resyncing ? 'Generating…' : 'Re-sync Keys'}
            </button>
            <button type="button" onClick={() => { setShowResyncModal(false); setResyncPin(''); }}
              className="flex-1 py-2.5 rounded-lg font-lato font-semibold text-sm"
              style={{ color: '#4A5568', border: '1px solid #BDE0FE' }}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
