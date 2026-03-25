'use client';

import { unwrapPrivateKey } from './keypair';

let sessionPrivateKey: CryptoKey | null = null;

export function getSessionKey(): CryptoKey | null {
  return sessionPrivateKey;
}

export function setSessionKey(key: CryptoKey): void {
  sessionPrivateKey = key;
}

export function clearSessionKey(): void {
  sessionPrivateKey = null;
}

export async function loadPrivateKey(pin: string): Promise<CryptoKey> {
  const wrapped = localStorage.getItem('pond_private_key_wrapped');
  if (!wrapped) {
    throw new Error('No private key found in localStorage');
  }
  const key = await unwrapPrivateKey(wrapped, pin);
  sessionPrivateKey = key;
  return key;
}

export function hasWrappedKey(): boolean {
  return !!localStorage.getItem('pond_private_key_wrapped');
}
