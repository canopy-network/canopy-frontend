/**
 * Seedphrase (BIP39 Mnemonic) generation and validation module
 *
 * Provides functionality to generate and validate 12-word mnemonics
 * for wallet creation and recovery.
 *
 * Security features:
 * - BIP39 standard compliance
 * - 12-word mnemonic (128 bits of entropy)
 * - Mnemonic validation
 * - Entropy to mnemonic conversion
 */

import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

/**
 * Default entropy strength for 12-word mnemonic
 * 128 bits = 12 words
 * 256 bits = 24 words
 */
const DEFAULT_STRENGTH = 128;

/**
 * Generates a new 12-word mnemonic seedphrase
 *
 * @returns 12-word mnemonic string (space-separated)
 * @throws Error if mnemonic generation fails
 *
 * @example
 * const mnemonic = generateSeedphrase();
 * // "witch collapse practice feed shame open despair creek road again ice least"
 */
export function generateSeedphrase(): string {
  try {
    // Generate mnemonic with 128 bits of entropy (12 words)
    const mnemonic = generateMnemonic(wordlist, DEFAULT_STRENGTH);
    return mnemonic;
  } catch (error) {
    throw new Error(
      `Failed to generate seedphrase: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validates a mnemonic seedphrase
 *
 * @param mnemonic - Mnemonic string to validate (space-separated words)
 * @returns true if valid, false otherwise
 *
 * @example
 * const isValid = validateSeedphrase("witch collapse practice feed shame open despair creek road again ice least");
 * // true
 */
export function validateSeedphrase(mnemonic: string): boolean {
  try {
    return validateMnemonic(mnemonic, wordlist);
  } catch (error) {
    return false;
  }
}

/**
 * Converts a mnemonic to entropy bytes
 *
 * @param mnemonic - Mnemonic string (space-separated words)
 * @returns Entropy as string (hex-encoded)
 * @throws Error if mnemonic is invalid
 *
 * @example
 * const entropy = mnemonicToEntropyString("witch collapse practice...");
 * // "f585c11aec520db57dd353c69554b21a"
 */
export function mnemonicToEntropyString(mnemonic: string): string {
  try {
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    // Convert Uint8Array to hex string
    return Array.from(entropy)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    throw new Error(
      `Failed to convert mnemonic to entropy: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Counts the number of words in a mnemonic
 *
 * @param mnemonic - Mnemonic string
 * @returns Number of words
 */
export function countWords(mnemonic: string): number {
  return mnemonic.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Normalizes a mnemonic by trimming and collapsing whitespace
 *
 * @param mnemonic - Mnemonic string to normalize
 * @returns Normalized mnemonic
 *
 * @example
 * normalizeMnemonic("  witch  collapse   practice  ")
 * // "witch collapse practice"
 */
export function normalizeMnemonic(mnemonic: string): string {
  return mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Checks if a word is in the BIP39 English wordlist
 *
 * @param word - Word to check
 * @returns true if word is in wordlist, false otherwise
 */
export function isValidWord(word: string): boolean {
  return wordlist.includes(word.toLowerCase());
}

/**
 * Splits a mnemonic into individual words
 *
 * @param mnemonic - Mnemonic string
 * @returns Array of words
 */
export function splitMnemonic(mnemonic: string): string[] {
  return normalizeMnemonic(mnemonic).split(' ');
}

/**
 * Validates mnemonic format and provides detailed error message
 *
 * @param mnemonic - Mnemonic string to validate
 * @returns Object with validation result and error message
 */
export function validateSeedphraseDetailed(mnemonic: string): {
  isValid: boolean;
  error?: string;
  wordCount?: number;
  invalidWords?: string[];
} {
  try {
    const normalized = normalizeMnemonic(mnemonic);
    const words = splitMnemonic(normalized);
    const wordCount = words.length;

    // Check word count
    if (wordCount !== 12 && wordCount !== 24) {
      return {
        isValid: false,
        error: `Invalid word count: ${wordCount}. Expected 12 or 24 words.`,
        wordCount,
      };
    }

    // Check for invalid words
    const invalidWords = words.filter((word) => !isValidWord(word));
    if (invalidWords.length > 0) {
      return {
        isValid: false,
        error: `Invalid words found: ${invalidWords.join(', ')}`,
        wordCount,
        invalidWords,
      };
    }

    // Validate checksum
    const isValid = validateMnemonic(normalized, wordlist);
    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid mnemonic checksum',
        wordCount,
      };
    }

    return {
      isValid: true,
      wordCount,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Formats a mnemonic for display (adds line breaks every 4 words)
 *
 * @param mnemonic - Mnemonic string
 * @returns Formatted mnemonic with line breaks
 *
 * @example
 * formatMnemonicForDisplay("witch collapse practice feed shame open despair creek road again ice least")
 * // "witch collapse practice feed\nshame open despair creek\nroad again ice least"
 */
export function formatMnemonicForDisplay(mnemonic: string): string {
  const words = splitMnemonic(mnemonic);
  const lines: string[] = [];

  for (let i = 0; i < words.length; i += 4) {
    lines.push(words.slice(i, i + 4).join(' '));
  }

  return lines.join('\n');
}

/**
 * Gets all words from the BIP39 English wordlist
 *
 * @returns Array of all BIP39 words
 */
export function getWordlist(): string[] {
  return [...wordlist];
}

/**
 * Suggests words from wordlist that start with given prefix
 *
 * @param prefix - Word prefix to search for
 * @param limit - Maximum number of suggestions (default: 5)
 * @returns Array of suggested words
 *
 * @example
 * suggestWords("wit")
 * // ["with", "witch", "witness", "within"]
 */
export function suggestWords(prefix: string, limit: number = 5): string[] {
  const lowerPrefix = prefix.toLowerCase();
  return wordlist
    .filter((word) => word.startsWith(lowerPrefix))
    .slice(0, limit);
}

/**
 * Obscures a mnemonic for display (shows first and last word only)
 *
 * @param mnemonic - Mnemonic to obscure
 * @returns Obscured mnemonic string
 *
 * @example
 * obscureMnemonic("witch collapse practice feed shame open despair creek road again ice least")
 * // "witch ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• least"
 */
export function obscureMnemonic(mnemonic: string): string {
  const words = splitMnemonic(mnemonic);
  if (words.length < 2) {
    return '•••';
  }

  const obscured = words.map((word, index) => {
    if (index === 0 || index === words.length - 1) {
      return word;
    }
    return '•••';
  });

  return obscured.join(' ');
}
