/**
 * @fileoverview API Timeout Utilities
 *
 * Utilities for handling API timeouts, race conditions, and cancellations.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

/**
 * Create a timeout promise that rejects after a specified time
 * @param ms - Timeout in milliseconds
 * @param message - Custom error message
 * @returns Promise that rejects after timeout
 */
export function createTimeout(ms: number, message?: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Race a promise against a timeout with optional AbortController
 * @param promise - The promise to race OR a function that accepts an AbortSignal
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Custom timeout error message
 * @returns Promise that resolves with the original promise or rejects on timeout
 */
export async function withTimeout<T>(
  promise: Promise<T> | ((signal: AbortSignal) => Promise<T>),
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  // Create AbortController for cancellation
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    // If promise is a function, call it with the abort signal
    const promiseToRace = typeof promise === 'function'
      ? promise(controller.signal)
      : promise;

    return await Promise.race([
      promiseToRace,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          // Abort the request when timeout occurs
          controller.abort();
          reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  } finally {
    // Clean up timeout if promise resolved before timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Create an AbortController with automatic timeout
 * @param timeoutMs - Timeout in milliseconds
 * @returns AbortController and signal
 */
export function createAbortController(timeoutMs?: number): {
  controller: AbortController;
  signal: AbortSignal;
} {
  const controller = new AbortController();

  if (timeoutMs) {
    setTimeout(() => {
      controller.abort();
    }, timeoutMs);
  }

  return {
    controller,
    signal: controller.signal
  };
}

/**
 * Execute an async function with retry logic
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Promise with result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    shouldRetry = () => true
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this was the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        break;
      }

      // Calculate delay with exponential backoff if enabled
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Timeout configurations for different operation types
 */
export const TIMEOUTS = {
  // SIWE operations
  SIWE_NONCE: 5000,           // 5 seconds to get nonce
  SIWE_VERIFY: 10000,         // 10 seconds to verify signature
  WALLET_SIGNATURE: 120000,   // 2 minutes for user to sign (user interaction)

  // Regular API operations
  API_READ: 8000,             // 8 seconds for GET requests
  API_WRITE: 15000,           // 15 seconds for POST/PUT/PATCH
  API_DELETE: 10000,          // 10 seconds for DELETE

  // File operations
  FILE_UPLOAD: 60000,         // 1 minute for file uploads
  FILE_DOWNLOAD: 30000,       // 30 seconds for downloads

  // Default
  DEFAULT: 10000,             // 10 seconds default
} as const;

/**
 * Create a promise that can be cancelled
 * @param executor - Promise executor function
 * @returns Cancellable promise
 */
export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}

export function makeCancellable<T>(
  promise: Promise<T>
): CancellablePromise<T> {
  let cancelled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      (value) => {
        if (!cancelled) {
          resolve(value);
        }
      },
      (error) => {
        if (!cancelled) {
          reject(error);
        }
      }
    );
  }) as CancellablePromise<T>;

  wrappedPromise.cancel = () => {
    cancelled = true;
  };

  return wrappedPromise;
}
