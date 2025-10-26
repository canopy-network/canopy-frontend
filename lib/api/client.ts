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

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: Record<string, any>,
    originalError?: AxiosError
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.originalError = originalError;
  }
}

/**
 * Error handler for API responses
 */
function handleApiError(error: AxiosError): never {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const apiError = data as ApiError;

    throw new ApiClientError(
      apiError.error?.message || `HTTP ${status} Error`,
      status,
      apiError.error?.code,
      apiError.error?.details,
      error
    );
  } else if (error.request) {
    // Request was made but no response received
    throw new ApiClientError(
      "Network Error: No response from server",
      undefined,
      "NETWORK_ERROR",
      undefined,
      error
    );
  } else {
    // Something else happened
    throw new ApiClientError(
      error.message || "Unknown error occurred",
      undefined,
      "UNKNOWN_ERROR",
      undefined,
      error
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

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
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
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth headers
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication headers for all mutation operations
        const method = config.method?.toUpperCase();
        if (
          method === "PUT" ||
          method === "POST" ||
          method === "PATCH" ||
          method === "DELETE"
        ) {
          const authHeaders = getAuthHeaders();
          Object.assign(config.headers, authHeaders);
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
        // Log response time for debugging
        const duration =
          Date.now() - ((response.config as any).metadata?.startTime || 0);
        console.debug(`API Request completed in ${duration}ms:`, {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
        });

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

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    config: AxiosRequestConfig,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
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

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        return this.makeRequest<T>(config, attempt + 1);
      }

      // Don't retry, handle the error
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
    config?: AxiosRequestConfig
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
    config?: AxiosRequestConfig
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
    config?: AxiosRequestConfig
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
    config?: AxiosRequestConfig
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
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
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
