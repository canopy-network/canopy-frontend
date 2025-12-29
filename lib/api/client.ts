/**
 * @fileoverview Base API client using Axios
 *
 * This module provides a centralized API client with error handling,
 * request/response interceptors, and authentication management.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiResponse, ApiError } from "@/types/api";
import { API_CONFIG } from "@/lib/config/api";
import { showErrorToast } from "@/lib/utils/error-handler";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API configuration interface
 */
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

type RequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
};

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  retryAttempts: API_CONFIG.retryAttempts,
  retryDelay: API_CONFIG.retryDelay,
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom API error class
 */
export class ApiClientError extends Error {
  public status?: number;
  public code?: string;
  public details?: Record<string, any>;
  public originalError?: AxiosError;
  public requestUrl?: string;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: Record<string, any>,
    originalError?: AxiosError,
    requestUrl?: string
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.originalError = originalError;
    this.requestUrl = requestUrl;
  }
}

/**
 * Error handler for API responses
 */
function handleApiError(error: AxiosError): never {
  // Extract request URL for debugging
  const baseURL = error.config?.baseURL || API_CONFIG.baseURL;
  const url = error.config?.url || "";
  const requestUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const apiError = data as ApiError;

    throw new ApiClientError(
      apiError.error?.message || `HTTP ${status} Error`,
      status,
      apiError.error?.code,
      apiError.error?.details,
      error,
      requestUrl
    );
  } else if (error.request) {
    // Request was made but no response received
    throw new ApiClientError(
      "Network Error: No response from server",
      undefined,
      "NETWORK_ERROR",
      undefined,
      error,
      requestUrl
    );
  } else {
    // Something else happened
    throw new ApiClientError(
      error.message || "Unknown error occurred",
      undefined,
      "UNKNOWN_ERROR",
      undefined,
      error,
      requestUrl
    );
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Check if error is retryable
 */
function isRetryableError(error: AxiosError): boolean {
  if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
    return false;
  }

  // Retry on network errors or 5xx server errors
  return (
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600)
  );
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Get authentication headers
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  // Check if we're in a browser environment before accessing localStorage
  if (typeof window !== "undefined") {
    // Get authorization token from localStorage
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("🔐 Adding Authorization header to request");
    }

    // Also add user ID if available (for backwards compatibility)
    const userId = localStorage.getItem("user_id");
    if (userId) {
      // headers["X-User-ID"] = userId;
    }
  }

  return headers;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

/**
 * Base API client class
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;
  // Request deduplication: track pending requests by key
  private pendingRequests = new Map<string, Promise<ApiResponse<any>>>();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Generate a unique key for request deduplication
   */
  private getRequestKey(
    method: string,
    url: string,
    params?: Record<string, any>,
    data?: any
  ): string {
    const paramsStr = params ? JSON.stringify(params) : "";
    const dataStr = data ? JSON.stringify(data) : "";
    return `${method}:${url}:${paramsStr}:${dataStr}`;
  }

  /**
   * Create Axios instance with base configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      paramsSerializer: {
        serialize: (params) => {
          // Filter out undefined/null values and serialize
          const filteredParams = Object.entries(params || {})
            .filter(([_, value]) => value !== undefined && value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

          // Use URLSearchParams for proper encoding
          const searchParams = new URLSearchParams();
          Object.entries(filteredParams).forEach(([key, value]) => {
            searchParams.append(key, String(value));
          });

          const queryString = searchParams.toString();

          return queryString;
        },
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth headers
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const typedConfig = config as RequestConfig;
        const shouldSkipAuth = typedConfig.skipAuth === true;

        // Add authentication headers for all mutation operations
        const method = config.method?.toUpperCase();
        if (
          !shouldSkipAuth &&
          (method === "GET" ||
            method === "PUT" ||
            method === "POST" ||
            method === "PATCH" ||
            method === "DELETE")
        ) {
          const authHeaders = getAuthHeaders();
          Object.assign(config.headers, authHeaders);
        }

        if (
          typeof FormData !== "undefined" &&
          typedConfig.data instanceof FormData
        ) {
          const headers = config.headers as any;
          if (headers?.delete) {
            headers.delete("Content-Type");
            headers.delete("content-type");
          } else if (headers) {
            delete headers["Content-Type"];
            delete headers["content-type"];
          }
        }

        // Add request timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle responses and errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        // Log error for debugging
        console.error("API Request failed:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });

        // Show toast notification for user-facing errors
        // Skip toast during retry attempts to avoid duplicate notifications
        const config = error.config as any;
        const shouldShowToast =
          !config?.skipErrorToast &&
          !config?.isRetrying &&
          typeof window !== "undefined";

        if (shouldShowToast) {
          const status = error.response?.status;

          // Don't show toast for 401 errors (handled by auth)
          if (status !== 401) {
            // Build full request URL for development debugging
            const baseURL = error.config?.baseURL || API_CONFIG.baseURL;
            const url = error.config?.url || "";
            const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

            showErrorToast(error, undefined, fullUrl);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make HTTP request with retry logic and request deduplication
   */
  private async makeRequest<T>(
    config: RequestConfig,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    const requestKey = this.getRequestKey(method, url, config.params, config.data);

    // Only deduplicate on first attempt (not retries) and only for GET requests
    // This prevents duplicate simultaneous requests while allowing retries to proceed
    if (attempt === 1 && method === "GET" && this.pendingRequests.has(requestKey)) {
      const pendingRequest = this.pendingRequests.get(requestKey);
      if (pendingRequest) {
        return pendingRequest as Promise<ApiResponse<T>>;
      }
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        const response = await this.axiosInstance.request<ApiResponse<T>>(config);
        // Remove from pending requests on success
        if (attempt === 1 && method === "GET") {
          this.pendingRequests.delete(requestKey);
        }
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        // Check if we should retry
        if (attempt < this.config.retryAttempts && isRetryableError(axiosError)) {
          const delay = calculateRetryDelay(attempt, this.config.retryDelay);

          console.warn(
            `API Request failed (attempt ${attempt}), retrying in ${delay}ms:`,
            {
              url: config.url,
              method: config.method,
              error: axiosError.message,
            }
          );

          // Mark as retry to skip toast during retry attempts
          (config as any).isRetrying = true;

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Retry the request (pass attempt + 1, won't be deduplicated)
          return this.makeRequest<T>(config, attempt + 1);
        }

        // Remove from pending requests on final error
        if (attempt === 1 && method === "GET") {
          this.pendingRequests.delete(requestKey);
        }

        // Don't retry, handle the error (toast will be shown in interceptor if not retrying)
        (config as any).isRetrying = false;
        handleApiError(axiosError);
      }
    })();

    // Store pending GET requests for deduplication (only on first attempt)
    if (attempt === 1 && method === "GET") {
      this.pendingRequests.set(requestKey, requestPromise);
    }

    return requestPromise;
  }

  private async makeRawRequest<T>(
    config: RequestConfig,
    attempt: number = 1
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (attempt < this.config.retryAttempts && isRetryableError(axiosError)) {
        const delay = calculateRetryDelay(attempt, this.config.retryDelay);

        console.warn(
          `API Request failed (attempt ${attempt}), retrying in ${delay}ms:`,
          {
            url: config.url,
            method: config.method,
            error: axiosError.message,
          }
        );

        (config as any).isRetrying = true;

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.makeRawRequest<T>(config, attempt + 1);
      }

      (config as any).isRetrying = false;
      handleApiError(axiosError);
    }
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * GET request
   */
  async get<T>(
    url: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: "GET",
      url,
      params,
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: "DELETE",
      url,
      ...config,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: "PATCH",
      url,
      data,
      ...config,
    });
  }

  async getRaw<T>(
    url: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRawRequest<T>({
      method: "GET",
      url,
      params,
      ...config,
    });
  }

  async postRaw<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRawRequest<T>({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  async putRaw<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRawRequest<T>({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  async deleteRaw<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRawRequest<T>({
      method: "DELETE",
      url,
      ...config,
    });
  }

  async patchRaw<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRawRequest<T>({
      method: "PATCH",
      url,
      data,
      ...config,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Update timeout
   */
  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    this.axiosInstance.defaults.timeout = timeout;
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Get the underlying Axios instance (for advanced usage)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// ============================================================================
// DEFAULT INSTANCE
// ============================================================================

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a new API client with custom configuration
 */
export function createApiClient(config: Partial<ApiConfig>): ApiClient {
  return new ApiClient(config);
}

/**
 * Set authentication token (for future JWT implementation)
 */
export function setAuthToken(token: string): void {
  apiClient.getAxiosInstance().defaults.headers.common[
    "Authorization"
  ] = `Bearer ${token}`;
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  delete apiClient.getAxiosInstance().defaults.headers.common["Authorization"];
}

/**
 * Set user ID for mock authentication
 */
export function setUserId(userId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_id", userId);
  }
}

/**
 * Clear user ID
 */
export function clearUserId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_id");
  }
}
