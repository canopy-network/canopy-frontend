/**
 * @fileoverview Base API type definitions
 *
 * This module contains the core API response types and authentication types
 * that are used across all API endpoints.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================================================
// BASE API TYPES
// ============================================================================

/**
 * Standard API response wrapper for successful requests
 */
export interface ApiResponse<T> {
  pagination: any;
  data: T;
  token?: string; // Authorization token from response headers
}

/**
 * Paginated API response for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * API error response structure
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Email verification request
 */
export interface AuthEmailRequest {
  email: string;
}

/**
 * Email verification response
 */
export interface AuthEmailResponse {
  message: string;
  email: string;
  code?: string; // Only present in development mode
}

/**
 * Code verification request
 */
export interface AuthVerifyRequest {
  email: string;
  code: string;
}

/**
 * User object from authentication
 */
export interface User {
  id: string;
  email: string;
  wallet_address: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  telegram_handle: string | null;
  twitter_handle: string | null;
  website_url: string | null;
  is_verified: boolean;
  email_verified_at: string | null;
  verification_tier: string;
  reputation_score: number;
  total_chains_created: number;
  total_cnpy_invested: number;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
}

/**
 * Code verification response
 */
export interface AuthVerifyResponse {
  message: string;
  user: User;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Health check response
 */
export interface HealthResponse {
  status: "healthy";
  timestamp: string;
  version: string;
}
