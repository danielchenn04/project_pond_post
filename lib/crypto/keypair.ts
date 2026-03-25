'use client';

const KEY_ALGO: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(KEY_ALGO, true, ['encrypt', 'decrypt']);
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  const bytes = new Uint8Array(exported);
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
}

async function deriveWrappingKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  );
}

export async function wrapPrivateKey(
  privateKey: CryptoKey,
  pin: string
): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await deriveWrappingKey(pin, salt);

  const wrapped = await window.crypto.subtle.wrapKey('pkcs8', privateKey, wrappingKey, {
    name: 'AES-GCM',
    iv,
  });

  // Store: salt(16) + iv(12) + wrapped key, all base64
  const combined = new Uint8Array(16 + 12 + wrapped.byteLength);
  combined.set(salt, 0);
  combined.set(iv, 16);
  combined.set(new Uint8Array(wrapped), 28);
  return btoa(Array.from(combined, b => String.fromCharCode(b)).join(''));
}

export async function unwrapPrivateKey(
  wrappedKeyB64: string,
  pin: string
): Promise<CryptoKey> {
  const combined = Uint8Array.from(atob(wrappedKeyB64), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const wrappedKey = combined.slice(28);

  const wrappingKey = await deriveWrappingKey(pin, salt);

  return window.crypto.subtle.unwrapKey(
    'pkcs8',
    wrappedKey,
    wrappingKey,
    { name: 'AES-GCM', iv },
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
}
