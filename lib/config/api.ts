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

export const API_CONFIG = {
  // Base URL for the API
  baseURL: (
    process.env.NEXT_PUBLIC_API_URL || "http://app.neochiba.net:3001"
  ).trim(),

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
