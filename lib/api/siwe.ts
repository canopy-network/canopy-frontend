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
 * @returns Promise with the nonce string
 */
export async function getSiweNonce(address: string): Promise<ApiResponse<SiweNonceResponse>> {
  return apiClient.post<SiweNonceResponse>("/api/v1/auth/siwe/nonce", {
    address,
  });
}

/**
 * Verify a SIWE signature and authenticate the user
 * Used for new users signing in with their wallet
 * @param message - The SIWE message that was signed
 * @param signature - The signature from the wallet
 * @returns Promise with the user object and authentication token
 */
export async function verifySiweSignature(
  message: string,
  signature: string
): Promise<ApiResponse<SiweVerifyResponse>> {
  return apiClient.post<SiweVerifyResponse>("/api/v1/auth/siwe/verify", {
    message,
    signature,
  });
}

/**
 * Link a wallet to an existing authenticated user account
 * Requires the user to be logged in (Bearer token in headers)
 * @param message - The SIWE message that was signed
 * @param signature - The signature from the wallet
 * @returns Promise with the updated user object
 */
export async function linkWalletToAccount(
  message: string,
  signature: string
): Promise<ApiResponse<WalletLinkResponse>> {
  return apiClient.post<WalletLinkResponse>("/api/v1/auth/wallet/link", {
    message,
    signature,
  });
}
