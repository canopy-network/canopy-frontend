/**
 * @fileoverview Health check API client
 *
 * This module provides methods for checking API health and status.
 * Useful for monitoring and debugging API connectivity.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import { HealthResponse } from "@/types/api";

// ============================================================================
// HEALTH API
// ============================================================================

/**
 * Health check API client
 */
export const healthApi = {
  /**
   * Check API health status
   *
   * @returns Promise resolving to health status
   *
   * @example
   * ```typescript
   * const health = await healthApi.checkHealth();
   * console.log(`API Status: ${health.data.status}`);
   * console.log(`Version: ${health.data.version}`);
   * ```
   */
  checkHealth: () => apiClient.get<HealthResponse>("/health"),
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Check if API is healthy
 *
 * @returns Promise resolving to boolean indicating API health
 *
 * @example
 * ```typescript
 * const isHealthy = await isApiHealthy();
 * if (isHealthy) {
 *   console.log('API is healthy and ready');
 * } else {
 *   console.log('API is not responding');
 * }
 * ```
 */
export async function isApiHealthy(): Promise<boolean> {
  try {
    const response = await healthApi.checkHealth();
    return response.data.status === "healthy";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

/**
 * Get API version information
 *
 * @returns Promise resolving to API version or null if unavailable
 *
 * @example
 * ```typescript
 * const version = await getApiVersion();
 * if (version) {
 *   console.log(`API Version: ${version}`);
 * }
 * ```
 */
export async function getApiVersion(): Promise<string | null> {
  try {
    const response = await healthApi.checkHealth();
    return response.data.version;
  } catch (error) {
    console.error("Failed to get API version:", error);
    return null;
  }
}

/**
 * Get API status with detailed information
 *
 * @returns Promise resolving to detailed API status
 *
 * @example
 * ```typescript
 * const status = await getApiStatus();
 * console.log('API Status:', {
 *   healthy: status.healthy,
 *   version: status.version,
 *   timestamp: status.timestamp,
 *   responseTime: status.responseTime
 * });
 * ```
 */
export async function getApiStatus() {
  const startTime = Date.now();

  try {
    const response = await healthApi.checkHealth();
    const responseTime = Date.now() - startTime;

    return {
      healthy: response.data.status === "healthy",
      version: response.data.version,
      timestamp: response.data.timestamp,
      responseTime,
      error: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      healthy: false,
      version: null,
      timestamp: null,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Wait for API to be healthy with timeout
 *
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 30000)
 * @param checkIntervalMs - Interval between checks in milliseconds (default: 1000)
 * @returns Promise resolving to boolean indicating if API became healthy
 *
 * @example
 * ```typescript
 * const ready = await waitForApiHealth(10000); // Wait up to 10 seconds
 * if (ready) {
 *   console.log('API is ready!');
 * } else {
 *   console.log('API did not become healthy in time');
 * }
 * ```
 */
export async function waitForApiHealth(
  timeoutMs: number = 30000,
  checkIntervalMs: number = 1000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await isApiHealthy()) {
      return true;
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
  }

  return false;
}

/**
 * Monitor API health continuously
 *
 * @param onStatusChange - Callback function called when status changes
 * @param checkIntervalMs - Interval between checks in milliseconds (default: 30000)
 * @returns Function to stop monitoring
 *
 * @example
 * ```typescript
 * const stopMonitoring = monitorApiHealth((status) => {
 *   console.log('API Status:', status.healthy ? 'Healthy' : 'Unhealthy');
 * });
 *
 * // Stop monitoring after 5 minutes
 * setTimeout(stopMonitoring, 5 * 60 * 1000);
 * ```
 */
export function monitorApiHealth(
  onStatusChange: (status: {
    healthy: boolean;
    version: string | null;
    error: string | null;
  }) => void,
  checkIntervalMs: number = 30000
): () => void {
  let isMonitoring = true;
  let lastStatus: {
    healthy: boolean;
    version: string | null;
    error: string | null;
  } | null = null;

  const checkHealth = async () => {
    if (!isMonitoring) return;

    try {
      const response = await healthApi.checkHealth();
      const currentStatus = {
        healthy: response.data.status === "healthy",
        version: response.data.version,
        error: null,
      };

      // Only call callback if status changed
      if (
        !lastStatus ||
        lastStatus.healthy !== currentStatus.healthy ||
        lastStatus.version !== currentStatus.version
      ) {
        onStatusChange(currentStatus);
        lastStatus = currentStatus;
      }
    } catch (error) {
      const currentStatus = {
        healthy: false,
        version: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      // Only call callback if status changed
      if (
        !lastStatus ||
        lastStatus.healthy !== currentStatus.healthy ||
        lastStatus.error !== currentStatus.error
      ) {
        onStatusChange(currentStatus);
        lastStatus = currentStatus;
      }
    }

    // Schedule next check
    if (isMonitoring) {
      setTimeout(checkHealth, checkIntervalMs);
    }
  };

  // Start monitoring
  checkHealth();

  // Return function to stop monitoring
  return () => {
    isMonitoring = false;
  };
}
