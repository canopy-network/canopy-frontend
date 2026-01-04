/**
 * Web Worker manager for decryption operations
 *
 * Provides a Promise-based API for the decrypt worker.
 * Automatically creates and manages the worker lifecycle.
 */

import type { DecryptWorkerMessage, DecryptWorkerResponse } from './decrypt-worker';

let worker: Worker | null = null;
let workerPromise: Promise<Worker> | null = null;
const pendingRequests = new Map<string, {
  resolve: (privateKey: Uint8Array) => void;
  reject: (error: Error) => void;
}>();

/**
 * Generate unique request ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
 * Initialize the decrypt worker lazily
 */
async function getWorker(): Promise<Worker> {
  if (worker) {
    return worker;
  }

  if (workerPromise) {
    return workerPromise;
  }

  workerPromise = new Promise((resolve, reject) => {
    try {
      // Create worker from the compiled worker file
      // Next.js will handle bundling this with the worker-loader
      const newWorker = new Worker(
        new URL('./decrypt-worker.ts', import.meta.url),
        { type: 'module' }
      );

      newWorker.onmessage = (event: MessageEvent<DecryptWorkerResponse>) => {
        const { type, id, success, privateKey, error } = event.data;

        if (type !== 'decrypt-result') {
          return;
        }

        const pending = pendingRequests.get(id);
        if (!pending) {
          console.warn('Received response for unknown request:', id);
          return;
        }

        pendingRequests.delete(id);

        if (success && privateKey) {
          pending.resolve(hexToBytes(privateKey));
        } else {
          pending.reject(new Error(error || 'Decryption failed'));
        }
      };

      newWorker.onerror = (error) => {
        console.error('Decrypt worker error:', error);
        // Reject all pending requests
        pendingRequests.forEach((pending) => {
          pending.reject(new Error('Worker error: ' + error.message));
        });
        pendingRequests.clear();
      };

      worker = newWorker;
      resolve(newWorker);
    } catch (error) {
      workerPromise = null;
      reject(error);
    }
  });

  return workerPromise;
}

/**
 * Decrypt private key using Web Worker
 *
 * Moves CPU-intensive Argon2 key derivation off the main thread.
 *
 * @param encryptedPrivateKey - Hex encoded encrypted private key
 * @param salt - Hex encoded salt
 * @param password - Password for decryption
 * @returns Promise resolving to decrypted private key bytes
 */
export async function decryptPrivateKeyInWorker(
  encryptedPrivateKey: string,
  salt: string,
  password: string
): Promise<Uint8Array> {
  // Check if we're in a browser environment with Worker support
  if (typeof Worker === 'undefined') {
    throw new Error('Web Workers are not supported in this environment');
  }

  const decryptWorker = await getWorker();
  const id = generateId();

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });

    const message: DecryptWorkerMessage = {
      type: 'decrypt',
      id,
      encryptedPrivateKey,
      salt,
      password,
    };

    decryptWorker.postMessage(message);

    // Timeout after 30 seconds (Argon2 shouldn't take that long)
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Decryption timed out'));
      }
    }, 30000);
  });
}

/**
 * Terminate the worker when no longer needed
 */
export function terminateDecryptWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
    workerPromise = null;
    pendingRequests.clear();
  }
}
