'use client';

import { useState } from 'react';
import Modal from './Modal';
import { loadPrivateKey } from '@/lib/crypto/session';

interface PinModalProps {
  open: boolean;
  onUnlocked: () => void;
  onCancel: () => void;
}

export default function PinModal({ open, onUnlocked, onCancel }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loadPrivateKey(pin);
      setPin('');
      onUnlocked();
    } catch {
      setError('Incorrect PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title="Enter your Session PIN" onClose={onCancel}>
      <p className="font-lato text-sm text-guardian-slate mb-4">
        Your PIN is needed to decrypt messages. It was set when you created your account.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Session PIN"
          className="w-full border-2 border-pond-blue rounded-lg px-3 py-2 font-lato text-sm focus:outline-none focus:border-moss-green"
          autoFocus
        />
        {error && <p className="text-wax-red text-sm font-lato">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pin}
          className="btn-primary w-full py-2 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
          style={{ backgroundColor: '#606C38' }}
        >
          {loading ? 'Unlocking…' : 'Unlock'}
        </button>
      </form>
    </Modal>
  );
}
