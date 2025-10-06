/**
 * @fileoverview Authentication API client
 *
 * This module provides type-safe methods for authentication endpoints.
 * Handles email verification and code verification flows.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import {
  AuthEmailRequest,
  AuthEmailResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
} from "@/types/api";

// ============================================================================
// AUTHENTICATION API
// ============================================================================

/**
 * Authentication API client
 */
export const authApi = {
  /**
   * Send verification code to email address
   *
   * @param data - Email verification request data
   * @returns Promise resolving to verification response
   *
   * @example
   * ```typescript
   * const response = await authApi.sendVerificationCode({
   *   email: 'user@example.com'
   * });
   *
   * // In development, the code is returned in the response
   * if (response.data.code) {
   *   console.log('Verification code:', response.data.code);
   * }
   * ```
   */
  sendVerificationCode: (data: AuthEmailRequest) =>
    apiClient.post<AuthEmailResponse>("/api/v1/auth/email", data),

  /**
   * Verify the 6-digit code sent to email
   *
   * @param data - Code verification request data
   * @returns Promise resolving to verification response
   *
   * @example
   * ```typescript
   * const response = await authApi.verifyCode({
   *   email: 'user@example.com',
   *   code: '123456'
   * });
   *
   * if (response.data.message === 'Email verified successfully') {
   *   // User is now authenticated
   *   console.log('Authentication successful!');
   * }
   * ```
   */
  verifyCode: (data: AuthVerifyRequest) =>
    apiClient.post<AuthVerifyResponse>("/api/v1/auth/verify", data),
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Complete authentication flow: send code and verify
 *
 * @param email - User's email address
 * @param code - 6-digit verification code
 * @returns Promise resolving to authentication result
 *
 * @example
 * ```typescript
 * try {
 *   const result = await authenticateUser('user@example.com', '123456');
 *   console.log('Authentication successful:', result);
 * } catch (error) {
 *   console.error('Authentication failed:', error.message);
 * }
 * ```
 */
export async function authenticateUser(email: string, code: string) {
  try {
    // First verify the code
    const verifyResponse = await authApi.verifyCode({ email, code });

    // In a real implementation, this would return a JWT token
    // For now, we'll return the verification response
    return {
      success: true,
      email: verifyResponse.data.email,
      message: verifyResponse.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

/**
 * Send verification code and return the code in development mode
 *
 * @param email - User's email address
 * @returns Promise resolving to verification code (dev mode only)
 *
 * @example
 * ```typescript
 * const code = await sendCodeAndGetCode('user@example.com');
 * if (code) {
 *   console.log('Use this code for verification:', code);
 * }
 * ```
 */
export async function sendCodeAndGetCode(
  email: string
): Promise<string | null> {
  try {
    const response = await authApi.sendVerificationCode({ email });

    // In development mode, the code is returned in the response
    if (response.data.code) {
      return response.data.code;
    }

    // In production, the code is only sent via email
    return null;
  } catch (error) {
    console.error("Failed to send verification code:", error);
    return null;
  }
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns True if email format is valid
 *
 * @example
 * ```typescript
 * if (isValidEmail('user@example.com')) {
 *   await authApi.sendVerificationCode({ email: 'user@example.com' });
 * }
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate verification code format
 *
 * @param code - 6-digit code to validate
 * @returns True if code format is valid
 *
 * @example
 * ```typescript
 * if (isValidCode('123456')) {
 *   await authApi.verifyCode({ email, code: '123456' });
 * }
 * ```
 */
export function isValidCode(code: string): boolean {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
}

/**
 * Complete authentication flow with validation
 *
 * @param email - User's email address
 * @param code - 6-digit verification code
 * @returns Promise resolving to authentication result with validation
 *
 * @example
 * ```typescript
 * const result = await authenticateWithValidation('user@example.com', '123456');
 * if (result.success) {
 *   console.log('User authenticated successfully');
 * } else {
 *   console.error('Authentication failed:', result.error);
 * }
 * ```
 */
export async function authenticateWithValidation(email: string, code: string) {
  // Validate inputs
  if (!isValidEmail(email)) {
    return {
      success: false,
      error: "Invalid email format",
    };
  }

  if (!isValidCode(code)) {
    return {
      success: false,
      error: "Invalid code format. Code must be 6 digits.",
    };
  }

  // Proceed with authentication
  return authenticateUser(email, code);
}

/**
 * Get authentication status (for future JWT implementation)
 *
 * @returns Current authentication status
 *
 * @example
 * ```typescript
 * const authStatus = getAuthStatus();
 * if (authStatus.isAuthenticated) {
 *   console.log('User is authenticated');
 * }
 * ```
 */
export function getAuthStatus() {
  // In development, check for mock user ID
  if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
    return {
      isAuthenticated: true,
      userId: "550e8400-e29b-41d4-a716-446655440000",
      isMock: true,
    };
  }

  // In production, check for stored user ID or JWT token
  if (typeof window !== "undefined") {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("auth_token");

    return {
      isAuthenticated: !!(userId || token),
      userId: userId || null,
      token: token || null,
      isMock: false,
    };
  }

  return {
    isAuthenticated: false,
    userId: null,
    token: null,
    isMock: false,
  };
}

/**
 * Clear authentication data
 *
 * @example
 * ```typescript
 * clearAuth();
 * console.log('User logged out');
 * ```
 */
export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_id");
    localStorage.removeItem("auth_token");
  }
}
