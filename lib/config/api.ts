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

/**
 * Get the base URL for API requests
 * 
 * In the browser (client-side), we use the Next.js proxy (/api) to avoid
 * mixed content issues when the frontend is served over HTTPS but the API
 * is HTTP. The proxy in next.config.mjs will forward requests to the actual API.
 * 
 * On the server (SSR), we use the full API URL directly.
 */
function getBaseURL(): string {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    // Use the Next.js proxy route in the browser
    // This avoids mixed content issues (HTTPS -> HTTP)
    return "/api";
  }

  // On the server, use the full API URL
  return process.env.NEXT_PUBLIC_API_URL || "http://app.neochiba.net:3001";
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
