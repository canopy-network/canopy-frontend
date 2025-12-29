/**
 * @fileoverview Error handling utilities with toast notifications
 *
 * This module provides utilities for handling errors and displaying
 * user-friendly toast notifications.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { toast } from "sonner";
import { ApiClientError } from "@/lib/api/client";

// ============================================================================
// ERROR THROTTLING
// ============================================================================

// Track recent error messages to prevent spam
const errorCache = new Map<string, number>();
const ERROR_THROTTLE_MS = 3000; // Don't show same error more than once per 3 seconds
const MAX_CONCURRENT_ERRORS = 3; // Maximum number of error toasts at once
let activeErrorCount = 0;

/**
 * Check if we should show this error toast (throttling logic)
 */
function shouldShowError(errorKey: string): boolean {
  const now = Date.now();
  const lastShown = errorCache.get(errorKey);

  // If we've shown this exact error recently, skip it
  if (lastShown && now - lastShown < ERROR_THROTTLE_MS) {
    return false;
  }

  // If we have too many active errors, skip it
  if (activeErrorCount >= MAX_CONCURRENT_ERRORS) {
    console.warn(`Too many active error toasts (${activeErrorCount}), suppressing error:`, errorKey);
    return false;
  }

  return true;
}

/**
 * Mark error as shown and track active count
 */
function markErrorShown(errorKey: string): void {
  errorCache.set(errorKey, Date.now());
  activeErrorCount++;

  // Decrement count after toast duration (5 seconds)
  setTimeout(() => {
    activeErrorCount = Math.max(0, activeErrorCount - 1);
  }, 5000);
}

/**
 * Clean up old error cache entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of errorCache.entries()) {
    if (now - timestamp > ERROR_THROTTLE_MS) {
      errorCache.delete(key);
    }
  }
}, ERROR_THROTTLE_MS);

// ============================================================================
// ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN:
    "Access denied. You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR:
    "An unexpected server error occurred. Our team has been notified.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Get user-friendly error message based on error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    // Use specific error code message if available
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }

    // Use HTTP status code to determine message
    if (error.status) {
      if (error.status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
      if (error.status === 403) return ERROR_MESSAGES.FORBIDDEN;
      if (error.status === 404) return ERROR_MESSAGES.NOT_FOUND;
      if (error.status === 422) return ERROR_MESSAGES.VALIDATION_ERROR;
      if (error.status >= 500) return ERROR_MESSAGES.SERVER_ERROR;
    }

    // Use the error message from the API if it's user-friendly
    if (error.message && !error.message.includes("HTTP")) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Display error toast notification
 */
export function showErrorToast(
  error: unknown,
  customMessage?: string,
  requestUrl?: string
): void {
  let message = customMessage || getErrorMessage(error);

  // Create a unique key for this error (for throttling)
  const errorKey = `${message}:${requestUrl || 'unknown'}`;

  // Check if we should show this error (throttling)
  if (!shouldShowError(errorKey)) {
    console.debug("Suppressing duplicate error:", message);
    return;
  }

  // In development, append the request URL to the error message
  if (
    process.env.NODE_ENV === "development" &&
    requestUrl &&
    typeof window !== "undefined"
  ) {
    message = `${message}\n\nRequest: ${requestUrl}`;
  }

  // Mark this error as shown
  markErrorShown(errorKey);

  toast.error(message, {
    duration: 5000,
    style: {
      background: "rgba(220, 38, 38, 0.15)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      color: "white",
      backdropFilter: "blur(8px)",
    },
  });

  // Log error to console for debugging
  console.error("Error:", error);
}

/**
 * Display success toast notification
 */
export function showSuccessToast(message: string): void {
  toast.success(message, {
    duration: 3000,
  });
}

/**
 * Display info toast notification
 */
export function showInfoToast(message: string): void {
  toast.info(message, {
    duration: 4000,
  });
}

/**
 * Display warning toast notification
 */
export function showWarningToast(message: string): void {
  toast.warning(message, {
    duration: 4000,
  });
}

// ============================================================================
// API WRAPPER
// ============================================================================

/**
 * Wrap async function with error handling
 * Automatically shows toast on error and prevents page crashes
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  options?: {
    errorMessage?: string;
    successMessage?: string;
    showSuccess?: boolean;
    requestUrl?: string;
  }
): Promise<T | null> {
  try {
    const result = await fn();

    if (options?.showSuccess && options?.successMessage) {
      showSuccessToast(options.successMessage);
    }

    return result;
  } catch (error) {
    showErrorToast(error, options?.errorMessage, options?.requestUrl);
    return null;
  }
}

/**
 * Wrap async function with error handling (throws error after showing toast)
 * Use when you need to handle the error in the calling code
 */
export async function withErrorToast<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
  requestUrl?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    showErrorToast(error, errorMessage, requestUrl);
    throw error;
  }
}
