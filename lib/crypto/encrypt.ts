'use client';

export async function importPublicKey(spkiBase64: string): Promise<CryptoKey> {
  const binaryString = atob(spkiBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return window.crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

export async function encryptForRecipient(
  plaintext: string,
  recipientPublicKeySpki: string
): Promise<string> {
  const publicKey = await importPublicKey(recipientPublicKeySpki);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  );
  // hex-encode
  return Array.from(new Uint8Array(ciphertext))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
