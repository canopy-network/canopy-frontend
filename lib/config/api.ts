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
 * All requests go through Next.js API routes in app/api/* which proxy to the backend.
 * - Client: baseURL = "/api" (relative path)
 * - Server: baseURL = Next.js server URL (absolute URL to same server)
 */
function getBaseURL(): string {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    // Client-side: use relative path to Next.js API routes
    return "/api";
  }

  // Server-side: use full URL to Next.js server with /api prefix
  // This ensures SSR requests also go through app/api/* routes
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  // In development, always use localhost:3000/api to hit Next.js API routes
  return "http://localhost:3000/api";
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
