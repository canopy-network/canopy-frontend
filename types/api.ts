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
  data: T;
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
 * Code verification response
 */
export interface AuthVerifyResponse {
  message: string;
  email: string;
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
