/**
 * Keystore management for multi-curve wallets
 *
 * Provides utilities to manage encrypted keys with curve type metadata.
 * Compatible with Go keystore format from canopy/lib/crypto/keystore.go
 */

import { hexToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { deriveAddress } from './address';
import { detectCurveType, detectPublicKeyCurve } from './curve-detection';
import { derivePublicKey } from './signing';
import { encryptPrivateKey, decryptPrivateKey } from './wallet';
import type { KeyEntry, EncryptedKeyEntry } from './types';

/**
 * Creates a key entry from a private key
 *
 * Automatically detects curve type and derives public key and address
 *
 * @param privateKeyHex - Hex-encoded private key
 * @param nickname - Optional nickname for this key
 * @returns Complete key entry with curve type and address
 */
export function createKeyEntry(
  privateKeyHex: string,
  nickname?: string
): KeyEntry {
  // Detect curve type from private key length
  const curveType = detectCurveType(privateKeyHex);

  // Derive public key using correct algorithm for this curve
  const publicKeyHex = derivePublicKey(privateKeyHex, curveType);

  // Derive address using correct algorithm for this curve
  const address = deriveAddress(publicKeyHex, curveType);

  return {
    privateKeyHex,
    publicKeyHex,
    address,
    curveType,
    nickname,
    createdAt: Date.now(),
  };
}

/**
 * Creates a key entry from a public key (watch-only)
 *
 * Useful for importing addresses without private keys
 *
 * @param publicKeyHex - Hex-encoded public key
 * @param nickname - Optional nickname
 * @returns Key entry without private key
 */
export function createWatchOnlyKeyEntry(
  publicKeyHex: string,
  nickname?: string
): Omit<KeyEntry, 'privateKeyHex'> {
  // Detect curve type from public key length
  const curveType = detectPublicKeyCurve(publicKeyHex);

  // Derive address using correct algorithm for this curve
  const address = deriveAddress(publicKeyHex, curveType);

  return {
    publicKeyHex,
    address,
    curveType,
    nickname,
    createdAt: Date.now(),
  };
}

/**
 * Encrypts a key entry for secure storage
 *
 * @param keyEntry - Key entry to encrypt
 * @param password - Password for encryption
 * @returns Encrypted key entry
 */
export async function encryptKeyEntry(
  keyEntry: KeyEntry,
  password: string
): Promise<EncryptedKeyEntry> {
  const publicKeyBytes = hexToBytes(keyEntry.publicKeyHex);
  const privateKeyBytes = hexToBytes(keyEntry.privateKeyHex);

  const encrypted = await encryptPrivateKey(
    publicKeyBytes,
    privateKeyBytes,
    password,
    keyEntry.address
  );

  return {
    publicKeyHex: encrypted.publicKey,
    encryptedPrivateKey: encrypted.encryptedPrivateKey,
    salt: encrypted.salt,
    address: encrypted.address,
    curveType: keyEntry.curveType,
    nickname: keyEntry.nickname,
    createdAt: keyEntry.createdAt,
  };
}

/**
 * Decrypts a key entry
 *
 * @param encryptedEntry - Encrypted key entry
 * @param password - Password used for encryption
 * @returns Decrypted key entry
 */
export async function decryptKeyEntry(
  encryptedEntry: EncryptedKeyEntry,
  password: string
): Promise<KeyEntry> {
  const privateKeyBytes = await decryptPrivateKey(encryptedEntry, password);
  const privateKeyHex = bytesToHex(privateKeyBytes);

  // Verify curve type matches
  const detectedCurve = detectCurveType(privateKeyHex, encryptedEntry.publicKeyHex);
  if (detectedCurve !== encryptedEntry.curveType) {
    console.warn(
      `Curve type mismatch: stored=${encryptedEntry.curveType}, detected=${detectedCurve}. Using detected.`
    );
  }

  // Derive public key to verify integrity
  const derivedPublicKey = derivePublicKey(privateKeyHex, encryptedEntry.curveType);
  if (derivedPublicKey !== encryptedEntry.publicKeyHex) {
    throw new Error('Key pair verification failed: public key mismatch');
  }

  // Derive address to verify integrity
  const derivedAddress = deriveAddress(encryptedEntry.publicKeyHex, encryptedEntry.curveType);
  if (derivedAddress !== encryptedEntry.address) {
    throw new Error('Key pair verification failed: address mismatch');
  }

  return {
    privateKeyHex,
    publicKeyHex: encryptedEntry.publicKeyHex,
    address: encryptedEntry.address,
    curveType: encryptedEntry.curveType,
    nickname: encryptedEntry.nickname,
    createdAt: encryptedEntry.createdAt,
  };
}

/**
 * Imports a key from Go keystore format
 *
 * Compatible with canopy/lib/crypto/keystore.go EncryptedPrivateKey format
 *
 * @param goKeystore - Go keystore entry
 * @returns Encrypted key entry with curve type detected
 */
export function importFromGoKeystore(goKeystore: {
  publicKey: string;
  salt: string;
  encrypted: string;
  keyAddress: string;
  keyNickname?: string;
}): EncryptedKeyEntry {
  // Detect curve type from public key
  const curveType = detectPublicKeyCurve(goKeystore.publicKey);

  // Verify address is correct for this curve type
  const derivedAddress = deriveAddress(goKeystore.publicKey, curveType);
  if (derivedAddress.toLowerCase() !== goKeystore.keyAddress.toLowerCase()) {
    console.warn(
      `Address mismatch when importing: expected ${goKeystore.keyAddress}, got ${derivedAddress}`
    );
  }

  return {
    publicKeyHex: goKeystore.publicKey,
    encryptedPrivateKey: goKeystore.encrypted,
    salt: goKeystore.salt,
    address: goKeystore.keyAddress,
    curveType,
    nickname: goKeystore.keyNickname,
    createdAt: Date.now(),
  };
}

/**
 * Exports a key entry to Go keystore format
 *
 * Compatible with canopy/lib/crypto/keystore.go EncryptedPrivateKey format
 *
 * @param encryptedEntry - Encrypted key entry
 * @returns Go keystore format
 */
export function exportToGoKeystore(encryptedEntry: EncryptedKeyEntry): {
  publicKey: string;
  salt: string;
  encrypted: string;
  keyAddress: string;
  keyNickname?: string;
} {
  return {
    publicKey: encryptedEntry.publicKeyHex,
    salt: encryptedEntry.salt,
    encrypted: encryptedEntry.encryptedPrivateKey,
    keyAddress: encryptedEntry.address,
    keyNickname: encryptedEntry.nickname,
  };
}

/**
 * Validates that a key entry is correctly formed
 *
 * @param keyEntry - Key entry to validate
 * @returns true if valid
 * @throws Error if invalid
 */
export function validateKeyEntry(keyEntry: KeyEntry): boolean {
  // Validate private key
  if (!keyEntry.privateKeyHex || keyEntry.privateKeyHex.length === 0) {
    throw new Error('Private key is required');
  }

  // Validate public key
  if (!keyEntry.publicKeyHex || keyEntry.publicKeyHex.length === 0) {
    throw new Error('Public key is required');
  }

  // Validate address
  if (!keyEntry.address || keyEntry.address.length !== 40) {
    throw new Error('Invalid address: must be 40 hex characters');
  }

  // Verify curve type detection
  const detectedCurve = detectCurveType(keyEntry.privateKeyHex, keyEntry.publicKeyHex);
  if (detectedCurve !== keyEntry.curveType) {
    throw new Error(
      `Curve type mismatch: stored=${keyEntry.curveType}, detected=${detectedCurve}`
    );
  }

  // Verify public key derivation
  const derivedPublicKey = derivePublicKey(keyEntry.privateKeyHex, keyEntry.curveType);
  if (derivedPublicKey !== keyEntry.publicKeyHex) {
    throw new Error('Public key does not match private key');
  }

  // Verify address derivation
  const derivedAddress = deriveAddress(keyEntry.publicKeyHex, keyEntry.curveType);
  if (derivedAddress.toLowerCase() !== keyEntry.address.toLowerCase()) {
    throw new Error('Address does not match public key');
  }

  return true;
}
