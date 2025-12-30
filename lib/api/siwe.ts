/**
 * @fileoverview SIWE (Sign-In With Ethereum) API Client
 *
 * This file contains API functions for SIWE-based authentication.
 * Supports wallet-based login and linking wallets to existing accounts.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { apiClient } from "./client";
import type { ApiResponse, User } from "@/types/api";
import { withTimeout, TIMEOUTS } from "@/lib/utils/api-timeout";

/**
 * SIWE nonce response
 */
export interface SiweNonceResponse {
  nonce: string;
}

/**
 * SIWE verify request
 */
export interface SiweVerifyRequest {
  message: string;
  signature: string;
}

/**
 * SIWE verify response (same as email auth response)
 */
export interface SiweVerifyResponse {
  message: string;
  user: User;
}

/**
 * Wallet link request
 */
export interface WalletLinkRequest {
  message: string;
  signature: string;
}

/**
 * Wallet link response
 */
export interface WalletLinkResponse {
  message: string;
  user: User;
}

/**
 * Get a nonce for SIWE message signing
 * This nonce should be used immediately to prevent replay attacks
 * @param address - The wallet address requesting a nonce
 * @returns Promise with the nonce string
 * @throws Error if address is invalid or server fails to generate nonce
 */
export async function getSiweNonce(address: string): Promise<ApiResponse<SiweNonceResponse>> {
  if (!address || typeof address !== 'string') {
    throw new Error('Valid wallet address is required to generate authentication token');
  }

  return withTimeout(
    apiClient.post<SiweNonceResponse>("/api/v1/auth/siwe/nonce", {
      address,
    }),
    TIMEOUTS.SIWE_NONCE,
    'Failed to get authentication token - request timed out. Please try again.'
  );
}

/**
 * Verify a SIWE signature and authenticate the user
 * Used for new users signing in with their wallet
 * @param message - The SIWE message that was signed
 * @param signature - The signature from the wallet
 * @returns Promise with the user object and authentication token
 * @throws Error if message or signature is invalid, or verification fails
 */
export async function verifySiweSignature(
  message: string,
  signature: string
): Promise<ApiResponse<SiweVerifyResponse>> {
  if (!message || typeof message !== 'string') {
    throw new Error('Valid SIWE message is required for verification');
  }

  if (!signature || typeof signature !== 'string') {
    throw new Error('Valid signature is required for verification');
  }

  return withTimeout(
    apiClient.post<SiweVerifyResponse>("/api/v1/auth/siwe/verify", {
      message,
      signature,
    }),
    TIMEOUTS.SIWE_VERIFY,
    'Failed to verify signature - request timed out. Please try again.'
  );
}

/**
 * Link a wallet to an existing authenticated user account
 * Requires the user to be logged in (Bearer token in headers)
 * @param message - The SIWE message that was signed
 * @param signature - The signature from the wallet
 * @returns Promise with the updated user object
 * @throws Error if message or signature is invalid, user is not authenticated, or wallet is already linked
 */
export async function linkWalletToAccount(
  message: string,
  signature: string
): Promise<ApiResponse<WalletLinkResponse>> {
  if (!message || typeof message !== 'string') {
    throw new Error('Valid SIWE message is required for wallet linking');
  }

  if (!signature || typeof signature !== 'string') {
    throw new Error('Valid signature is required for wallet linking');
  }

  return withTimeout(
    apiClient.post<WalletLinkResponse>("/api/v1/auth/wallet/link", {
      message,
      signature,
    }),
    TIMEOUTS.SIWE_VERIFY,
    'Failed to link wallet - request timed out. Please try again.'
  );
}
