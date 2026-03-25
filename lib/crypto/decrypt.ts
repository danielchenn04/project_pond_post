'use client';

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export async function decryptMessage(
  encryptedBody: string,
  privateKey: CryptoKey
): Promise<string> {
  const ciphertext = hexToArrayBuffer(encryptedBody);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
