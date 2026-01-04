/**
 * Web Worker for CPU-intensive decryption operations
 *
 * Moves Argon2 key derivation off the main thread to prevent UI blocking.
 * Argon2 is intentionally slow (security feature) but shouldn't block rendering.
 */

import { argon2i } from '@noble/hashes/argon2.js';

const ARGON2_PARAMS = {
  t: 3,           // time cost (iterations)
  m: 32 * 1024,   // memory cost in KB (32 MB)
  p: 4,           // parallelism (threads)
};

const NONCE_LENGTH = 12;

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Derives an AES-256 key from a password and salt using Argon2i
 */
function deriveKey(password: string, salt: Uint8Array): Uint8Array {
  const passwordBytes = new TextEncoder().encode(password);

  const key = argon2i(passwordBytes, salt, {
    t: ARGON2_PARAMS.t,
    m: ARGON2_PARAMS.m,
    p: ARGON2_PARAMS.p,
    dkLen: 32,
  });

  return new Uint8Array(key);
}

export interface DecryptWorkerMessage {
  type: 'decrypt';
  id: string;
  encryptedPrivateKey: string;
  salt: string;
  password: string;
}

export interface DecryptWorkerResponse {
  type: 'decrypt-result';
  id: string;
  success: boolean;
  privateKey?: string; // hex encoded
  error?: string;
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Web Worker message handler
self.onmessage = async (event: MessageEvent<DecryptWorkerMessage>) => {
  const { type, id, encryptedPrivateKey, salt, password } = event.data;

  if (type !== 'decrypt') {
    return;
  }

  try {
    // Decode hex-encoded data
    const saltBytes = hexToBytes(salt);
    const encryptedData = hexToBytes(encryptedPrivateKey);

    // Derive key using Argon2i (CPU-intensive, but now in worker thread)
    const derivedKey = deriveKey(password, saltBytes);

    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      derivedKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Use first 12 bytes of derived key as nonce
    const nonce = derivedKey.slice(0, NONCE_LENGTH);

    // Decrypt private key with AES-GCM
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      cryptoKey,
      encryptedData.buffer
    );

    const response: DecryptWorkerResponse = {
      type: 'decrypt-result',
      id,
      success: true,
      privateKey: bytesToHex(new Uint8Array(decryptedData)),
    };

    self.postMessage(response);
  } catch (error) {
    const response: DecryptWorkerResponse = {
      type: 'decrypt-result',
      id,
      success: false,
      error: error instanceof Error && error.name === 'OperationError'
        ? "There's a problem with your password. Please try again."
        : `Failed to decrypt: ${error instanceof Error ? error.message : String(error)}`,
    };

    self.postMessage(response);
  }
};
