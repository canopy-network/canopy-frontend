/**
 * @fileoverview Request Queue Manager
 *
 * Manages concurrent API requests to prevent UI freezing when multiple
 * requests fail simultaneously. Implements request queueing and throttling.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

export interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  priority: number;
}

/**
 * Request Queue Manager
 * Limits concurrent API requests to prevent UI freezing
 */
export class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeCount = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add a request to the queue
   * @param fn - Function that returns a promise
   * @param priority - Higher priority requests are executed first (default: 0)
   * @returns Promise that resolves with the function result
   */
  async add<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, priority });

      // Sort queue by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    // If we're at max concurrent requests, wait
    if (this.activeCount >= this.maxConcurrent) {
      return;
    }

    // Get next request from queue
    const request = this.queue.shift();
    if (!request) {
      return;
    }

    this.activeCount++;

    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeCount--;

      // Process next item in queue
      this.processQueue();
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.queue.forEach(req => {
      req.reject(new Error('Request queue cleared'));
    });
    this.queue = [];
  }

  /**
   * Get queue status
   */
  getStatus(): { active: number; pending: number } {
    return {
      active: this.activeCount,
      pending: this.queue.length
    };
  }

  /**
   * Update max concurrent requests
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
    this.processQueue();
  }
}

/**
 * Global request queue instance
 * Limits concurrent API requests to prevent UI freezing
 */
export const globalRequestQueue = new RequestQueue(6);

/**
 * Wrap an async function with request queueing
 * @param fn - Function to wrap
 * @param priority - Request priority (higher = executed first)
 * @returns Wrapped function that uses the request queue
 */
export function withRequestQueue<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  priority: number = 0
): T {
  return ((...args: any[]) => {
    return globalRequestQueue.add(() => fn(...args), priority);
  }) as T;
}
