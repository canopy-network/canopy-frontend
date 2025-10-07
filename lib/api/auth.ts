/**
 * @fileoverview Authentication API Client
 *
 * This file contains API functions for email-based authentication.
 * Supports sending verification codes and verifying them.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

/**
 * Email verification code request
 */
export interface SendEmailCodeRequest {
  email: string;
}

/**
 * Email verification code response
 */
export interface SendEmailCodeResponse {
  message: string;
  email: string;
  code?: string; // Only present in development mode
}

/**
 * Verify code request
 */
export interface VerifyCodeRequest {
  email: string;
  code: string;
}

/**
 * Verify code response
 */
export interface VerifyCodeResponse {
  message: string;
  email: string;
  token?: string; // JWT token (when implemented)
}

/**
 * Sends a 6-digit verification code to the provided email address
 * @param email - Valid email address
 * @returns Promise with the API response
 */
export async function sendEmailCode(
  email: string
): Promise<ApiResponse<SendEmailCodeResponse>> {
  return apiClient.post<SendEmailCodeResponse>("/api/v1/auth/email", {
    email,
  });
}

/**
 * Verifies the 6-digit code sent to the user's email address
 * @param email - Valid email address
 * @param code - 6-digit numeric code
 * @returns Promise with the API response
 */
export async function verifyCode(
  email: string,
  code: string
): Promise<ApiResponse<VerifyCodeResponse>> {
  return apiClient.post<VerifyCodeResponse>("/api/v1/auth/verify", {
    email,
    code,
  });
}
