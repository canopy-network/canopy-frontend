/**
 * @fileoverview API client exports
 *
 * This module provides a centralized export point for all API clients and utilities.
 * Import from this file to get access to all API functionality.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================================================
// CORE CLIENT
// ============================================================================

export {
  ApiClient,
  ApiClientError,
  apiClient,
  createApiClient,
  setAuthToken,
  clearAuthToken,
  setUserId,
  clearUserId,
} from "./client";

// ============================================================================
// DOMAIN CLIENTS
// ============================================================================

// Chains API
export {
  chainsApi,
  virtualPoolsApi,
  getChainsWithTemplates,
  getChainsWithCreators,
  getChainsWithRelations,
  getActiveChains,
  getGraduatedChains,
  getChainsByCreator,
  getChainsByTemplate,
} from "./chains";

// Templates API
export {
  templatesApi,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  getActiveTemplates,
  getTemplatesByLanguage,
  getTemplatesByDeploymentTime,
  getTemplatesByComplexityLevel,
  searchTemplates,
  getTemplateStatistics,
} from "./templates";

// Authentication API
export { sendEmailCode, verifyCode } from "./auth";

// Health API
export {
  healthApi,
  isApiHealthy,
  getApiVersion,
  getApiStatus,
  waitForApiHealth,
  monitorApiHealth,
} from "./health";

// Media Upload API
export {
  uploadMedia,
  uploadSingleFile,
  uploadLogo,
  uploadGallery,
  uploadWhitepaper,
  type FileCategory,
  type UploadResult,
  type UploadResponse,
} from "./media";

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

// Re-export commonly used types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  AuthEmailRequest,
  AuthEmailResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
  HealthResponse,
} from "@/types/api";

export type {
  Chain,
  ChainStatus,
  Creator,
  VirtualPool,
  Transaction,
  CreateChainRequest,
  GetChainsParams,
  GetTransactionsParams,
} from "@/types/chains";

export type {
  Template,
  TemplateCategory,
  ComplexityLevel,
  GetTemplatesParams,
} from "@/types/templates";
