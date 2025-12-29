/**
 * @fileoverview API Configuration
 *
 * This file contains configuration settings for the API client.
 * Update these values based on your environment.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

/**
 * Get the base URL for API requests
 *
 * Uses NEXT_PUBLIC_API_URL for both client and server to call the backend directly.
 */
function getBaseURL(): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (envBaseUrl) {
    return normalizeBaseUrl(envBaseUrl);
  }

  // Fallback for local dev if env var is missing.
  return "http://localhost:3001";
}

export const API_CONFIG = {
  // Base URL for the API
  // Uses proxy in browser, full URL on server
  baseURL: getBaseURL(),

  // Development mode settings
  devMode: process.env.NEXT_PUBLIC_DEV_MODE === "true",
  mockAuth: process.env.NEXT_PUBLIC_MOCK_AUTH === "true",

  // Debug settings
  enableDebugLogging: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === "true",

  // Request settings
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second

  // Mock user ID for development
  mockUserId: "550e8400-e29b-41d4-a716-446655440000",
} as const;

export default API_CONFIG;
