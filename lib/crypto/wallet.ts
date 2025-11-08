"use client";

/**
 * Wallet generation and encryption module
 *
 * Provides BLS12-381 key pair generation and AES-GCM encryption
 * for Canopy blockchain.
 *
 * Security features:
 * - BLS12-381 cryptography (Canopy blockchain standard)
 * - Argon2id key derivation (memory-hard, GPU-resistant)
 * - AES-256-GCM authenticated encryption
 * - Random salt per wallet (prevents rainbow table attacks)
 */

import { bls12_381 } from '@noble/curves/bls12-381.js';
import { argon2id } from '@noble/hashes/argon2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

/**
 * Represents a blockchain key pair with private key, public key, and address
 */
export interface KeyPair {
    privateKey: string; // hex encoded BLS12-381 private key
    publicKey: string;  // hex encoded BLS12-381 public key
    address: string;    // blockchain address derived from public key
}

/**
 * Represents an encrypted form of a private key for secure storage
 */
export interface EncryptedKeyPair {
    publicKey: string;           // hex encoded public key
    encryptedPrivateKey: string; // hex encoded AES-GCM encrypted private key
    salt: string;                // hex encoded salt for Argon2 KDF
    address: string;             // blockchain address
}

/**
 * Argon2id parameters for key derivation
 * - time: 3 iterations
 * - memory: 32 MB (32 * 1024 KB)
 * - parallelism: 4 threads
 */
const ARGON2_PARAMS = {
    t: 3,           // time cost (iterations)
    m: 32 * 1024,   // memory cost in KB (32 MB)
    p: 4,           // parallelism (threads)
};

const SALT_LENGTH = 16;  // 16 bytes (128 bits)
const NONCE_LENGTH = 12; // 12 bytes (96 bits) for AES-GCM

/**
 * Derives a blockchain address from a BLS12-381 public key
 * Uses SHA256 hash and takes first 20 bytes, similar to Ethereum
 */
function deriveAddress(publicKey: Uint8Array): string {
    const hash = sha256(publicKey);
    // Take first 20 bytes and encode as hex with 0x prefix
    return '0x' + bytesToHex(hash.slice(0, 20));
}

/**
 * Derives an AES-256 key from a password and salt using Argon2id
 * Returns 32-byte key suitable for AES-256-GCM encryption
 */
function deriveKey(password: string, salt: Uint8Array): Uint8Array {
    const passwordBytes = new TextEncoder().encode(password);

    // Argon2id key derivation (32 bytes output for AES-256)
    const key = argon2id(passwordBytes, salt, {
        t: ARGON2_PARAMS.t,
        m: ARGON2_PARAMS.m,
        p: ARGON2_PARAMS.p,
        dkLen: 32, // Output 32 bytes for AES-256
    });

    // Create new Uint8Array to ensure correct ArrayBuffer type for Web Crypto API
    return new Uint8Array(key);
}

/**
 * Generates a new BLS12-381 key pair for blockchain use
 *
 * @returns KeyPair with private key, public key, and address
 * @throws Error if key generation fails
 */
export function generateKeyPair(): KeyPair {
    try {
        // Use BLS12-381 short signatures (G1 signatures, G2 public keys)
        const { secretKey, publicKey } = bls12_381.shortSignatures.keygen();

        // Convert public key point to bytes for address derivation
        const publicKeyBytes = publicKey.toBytes();

        // Derive blockchain address from public key
        const address = deriveAddress(publicKeyBytes);

        return {
            privateKey: bytesToHex(secretKey),
            publicKey: publicKey.toHex(),
            address,
        };
    } catch (error) {
        throw new Error(`Failed to generate key pair: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Encrypts a private key using AES-256-GCM with Argon2id key derivation
 *
 * @param publicKeyBytes - BLS12-381 public key bytes
 * @param privateKeyBytes - BLS12-381 private key bytes to encrypt
 * @param password - Password for encryption
 * @param address - Blockchain address
 * @returns EncryptedKeyPair with encrypted data and salt
 * @throws Error if encryption fails
 */
export async function encryptPrivateKey(
    publicKeyBytes: Uint8Array,
    privateKeyBytes: Uint8Array,
    password: string,
    address: string
): Promise<EncryptedKeyPair> {
    try {
        // Generate random 16-byte salt
        const salt = new Uint8Array(SALT_LENGTH);
        crypto.getRandomValues(salt);

        // Derive AES-256 key using Argon2id (synchronous)
        const derivedKey = deriveKey(password, salt);

        // Import key for Web Crypto API
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            derivedKey,
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );

        // Use first 12 bytes of derived key as nonce
        const nonce = derivedKey.slice(0, NONCE_LENGTH);

        // Encrypt private key with AES-GCM
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: nonce },
            cryptoKey,
            privateKeyBytes
        );

        return {
            publicKey: bytesToHex(publicKeyBytes),
            encryptedPrivateKey: bytesToHex(new Uint8Array(encryptedData)),
            salt: bytesToHex(salt),
            address,
        };
    } catch (error) {
        throw new Error(`Failed to encrypt private key: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Decrypts an encrypted private key using the password
 *
 * @param encryptedKeyPair - Encrypted key pair data
 * @param password - Password used for encryption
 * @returns Decrypted private key bytes
 * @throws Error if decryption fails (wrong password or corrupted data)
 */
export async function decryptPrivateKey(
    encryptedKeyPair: EncryptedKeyPair,
    password: string
): Promise<Uint8Array> {
    try {
        // Decode hex-encoded data
        const salt = hexToBytes(encryptedKeyPair.salt);
        const encryptedData = hexToBytes(encryptedKeyPair.encryptedPrivateKey);

        // Derive same key using password and salt (synchronous)
        const derivedKey = deriveKey(password, salt);

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
            encryptedData
        );

        return new Uint8Array(decryptedData);
    } catch (error) {
        // Web Crypto throws generic errors, provide more context
        if (error instanceof Error && error.name === 'OperationError') {
            throw new Error('Failed to decrypt: incorrect password or corrupted data');
        }
        throw new Error(`Failed to decrypt private key: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Generates a new encrypted key pair with password protection
 *
 * @param password - Password for encrypting the private key
 * @returns Object with both unencrypted KeyPair and EncryptedKeyPair
 * @throws Error if generation or encryption fails
 */
export async function generateEncryptedKeyPair(password: string): Promise<{
    keyPair: KeyPair;
    encrypted: EncryptedKeyPair;
}> {
    // Generate new key pair
    const keyPair = generateKeyPair();

    // Convert hex strings to bytes for encryption
    const privateKeyBytes = hexToBytes(keyPair.privateKey);
    const publicKeyBytes = hexToBytes(keyPair.publicKey);

    // Encrypt the private key
    const encrypted = await encryptPrivateKey(
        publicKeyBytes,
        privateKeyBytes,
        password,
        keyPair.address
    );

    return { keyPair, encrypted };
}

/**
 * Restores a key pair from encrypted data using a password
 *
 * @param encrypted - Encrypted key pair data
 * @param password - Password used for encryption
 * @returns Restored KeyPair with private key, public key, and address
 * @throws Error if decryption fails or data is invalid
 */
export async function restoreKeyPair(
    encrypted: EncryptedKeyPair,
    password: string
): Promise<KeyPair> {
    // Decrypt private key
    const privateKeyBytes = await decryptPrivateKey(encrypted, password);

    // Derive public key from private key to verify integrity
    const publicKey = bls12_381.shortSignatures.getPublicKey(privateKeyBytes);
    const derivedPublicKey = publicKey.toHex();

    // Verify public key matches
    if (derivedPublicKey !== encrypted.publicKey) {
        throw new Error('Key pair verification failed: public key mismatch');
    }

    // Verify address matches
    const publicKeyBytes = publicKey.toBytes();
    const derivedAddress = deriveAddress(publicKeyBytes);
    if (derivedAddress !== encrypted.address) {
        throw new Error('Key pair verification failed: address mismatch');
    }

    return {
        privateKey: bytesToHex(privateKeyBytes),
        publicKey: derivedPublicKey,
        address: encrypted.address,
    };
}

/**
 * Validates a password meets minimum security requirements
 *
 * @param password - Password to validate
 * @returns true if valid, throws Error otherwise
 */
export function validatePassword(password: string): boolean {
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }

    if (password.length > 128) {
        throw new Error('Password must be at most 128 characters');
    }

    // Check for basic complexity
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    if (!hasLower || !hasUpper || !hasDigit) {
        throw new Error('Password must contain lowercase, uppercase, and digit');
    }

    return true;
}

/**
 * Verifies a password against an encrypted key pair
 *
 * @param encrypted - Encrypted key pair data
 * @param password - Password to verify
 * @returns true if password is correct, false otherwise
 */
export async function verifyPassword(
    encrypted: EncryptedKeyPair,
    password: string
): Promise<boolean> {
    try {
        await decryptPrivateKey(encrypted, password);
        return true;
    } catch {
        return false;
    }
}