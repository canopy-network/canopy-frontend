/**
 * @fileoverview SIWE Message Builder
 *
 * Utilities for creating and formatting SIWE (Sign-In With Ethereum) messages.
 * These messages are signed by the user's wallet to prove ownership.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { SiweMessage } from "siwe";

/**
 * Create a SIWE message for authentication
 * @param address - Ethereum address of the wallet
 * @param nonce - Random nonce from the backend (prevents replay attacks)
 * @param chainId - Chain ID of the connected network
 * @returns SIWE message object
 */
export function createSiweMessage(
  address: string,
  nonce: string,
  chainId: number
): SiweMessage {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("SIWE messages can only be created in browser environment");
  }

  return new SiweMessage({
    domain: window.location.host,
    address,
    statement: "Sign in to Canopy",
    uri: window.location.origin,
    version: "1",
    chainId,
    nonce,
  });
}

/**
 * Create a SIWE message for linking a wallet to an existing account
 * @param address - Ethereum address of the wallet
 * @param nonce - Random nonce from the backend (prevents replay attacks)
 * @param chainId - Chain ID of the connected network
 * @returns SIWE message object
 */
export function createWalletLinkMessage(
  address: string,
  nonce: string,
  chainId: number
): SiweMessage {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("SIWE messages can only be created in browser environment");
  }

  return new SiweMessage({
    domain: window.location.host,
    address,
    statement: "Link this wallet to your Canopy account",
    uri: window.location.origin,
    version: "1",
    chainId,
    nonce,
  });
}

/**
 * Format SIWE message for display
 * @param message - SIWE message object
 * @returns Formatted message string
 */
export function formatSiweMessage(message: SiweMessage): string {
  return message.prepareMessage();
}
