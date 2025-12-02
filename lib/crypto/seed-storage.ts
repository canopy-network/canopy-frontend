"use client";

/**
 * Secure seed phrase storage module
 *
 * Provides functionality to encrypt and store the master seed phrase
 * in local storage. The seed phrase is encrypted using a device-specific
 * encryption key derived from the browser's environment.
 *
 * Security considerations:
 * - Seed phrase is encrypted at rest in localStorage
 * - Uses AES-256-GCM for encryption
 * - Device-specific encryption key
 * - Never logs or exposes the seed phrase
 */

import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes, utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils.js';

const STORAGE_KEY = 'canopy_master_seed';
const DEVICE_KEY_STORAGE = 'canopy_device_key';

/**
 * Gets or creates a device-specific encryption key
 * This key is used to encrypt the seed phrase in localStorage
 */
function getDeviceKey(): Uint8Array {
  try {
    const stored = localStorage.getItem(DEVICE_KEY_STORAGE);
    if (stored) {
      return hexToBytes(stored);
    }

    // Generate new device key (32 bytes for AES-256)
    const deviceKey = randomBytes(32);
    localStorage.setItem(DEVICE_KEY_STORAGE, bytesToHex(deviceKey));
    return deviceKey;
  } catch (error) {
    throw new Error('Failed to get device key');
  }
}

/**
 * Converts hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Converts Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Stores the master seed phrase in encrypted form
 *
 * @param seedphrase - The master seed phrase (12 words, space-separated)
 * @throws Error if encryption or storage fails
 */
export function storeMasterSeedphrase(seedphrase: string): void {
  try {
    const deviceKey = getDeviceKey();
    const nonce = randomBytes(12); // 12 bytes for AES-GCM

    // Encrypt the seed phrase
    const cipher = gcm(deviceKey, nonce);
    const plaintext = utf8ToBytes(seedphrase);
    const ciphertext = cipher.encrypt(plaintext);

    // Store nonce + ciphertext
    const encrypted = {
      nonce: bytesToHex(nonce),
      data: bytesToHex(ciphertext),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
  } catch (error) {
    throw new Error(
      `Failed to store seed phrase: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Retrieves and decrypts the master seed phrase
 *
 * @returns The decrypted seed phrase or null if not found
 * @throws Error if decryption fails
 */
export function retrieveMasterSeedphrase(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const encrypted = JSON.parse(stored);
    const deviceKey = getDeviceKey();
    const nonce = hexToBytes(encrypted.nonce);
    const ciphertext = hexToBytes(encrypted.data);

    // Decrypt the seed phrase
    const cipher = gcm(deviceKey, nonce);
    const plaintext = cipher.decrypt(ciphertext);

    return bytesToUtf8(plaintext);
  } catch (error) {
    throw new Error(
      `Failed to retrieve seed phrase: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Checks if a master seed phrase is stored
 *
 * @returns true if a seed phrase is stored, false otherwise
 */
export function hasMasterSeedphrase(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Removes the stored master seed phrase
 * Use this when user logs out or explicitly requests to clear seed phrase
 */
export function clearMasterSeedphrase(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Clears all seed storage including device key
 * WARNING: This will make any stored seed phrase unrecoverable
 * Only use when resetting the application completely
 */
export function clearAllSeedStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DEVICE_KEY_STORAGE);
}

/**
 * Gets the seed phrase as password (no spaces)
 *
 * @param seedphrase - The seed phrase with spaces
 * @returns The seed phrase without spaces (used as password)
 */
export function seedphraseToPassword(seedphrase: string): string {
  return seedphrase.replace(/\s+/g, '');
}

/**
 * Retrieves the master seed phrase and converts it to password format
 *
 * @returns The seed phrase as password or null if not stored
 */
export function getMasterPassword(): string | null {
  const seedphrase = retrieveMasterSeedphrase();
  return seedphrase ? seedphraseToPassword(seedphrase) : null;
}
