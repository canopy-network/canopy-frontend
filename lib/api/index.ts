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
  getAllChains,
  getAllGraduatedChains,
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

// Users API
export { updateProfile, uploadUserMedia } from "./users";

// Transactions API
export {
  getChainTransactions,
  type Transaction as ApiTransaction,
} from "./transactions";

// Price History API
export {
  getChainPriceHistory,
  getTimeRangeForTimeframe,
  convertPriceHistoryToChart,
  convertVolumeHistoryToChart,
  type PriceHistoryDataPoint,
} from "./price-history";

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

// GitHub API
export {
  fetchUserRepositories,
  verifyRepositoryOwnership,
  getGitHubUser,
  type Repository as GitHubRepository,
} from "./github-repos";

// Wallet API
export { walletApi } from "./wallet";

// Portfolio API
export { portfolioApi } from "./portfolio";

// Wallet Transaction API
export {
  walletTransactionApi,
  waitForTransactionCompletion,
} from "./wallet-transactions";

// Transactions API (wallet transactions)
export { transactionsApi } from "./transactions";

// Staking API
export { stakingApi } from "./staking";

// Governance API
export { governanceApi } from "./governance";

// Validators API
export {
  validatorsApi,
  type ValidatorData,
  type ValidatorsResponse,
  type ValidatorsRequest,
  type ValidatorDetailData,
  type CrossChainStake,
  type SlashingHistory,
} from "./validators";

// Orderbook API
export { orderbookApi } from "./orderbook";

// Params API (blockchain parameters)
export { paramsApi } from "./params";

// Address Book API
export { addressBookApi } from "./address-book";

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
  ChainAsset,
  AssetType,
} from "@/types/chains";

export type {
  Template,
  TemplateCategory,
  ComplexityLevel,
  GetTemplatesParams,
} from "@/types/templates";

// Explorer API
export {
  explorerApi,
  getExplorerTransactions,
  getExplorerTransaction,
  getExplorerBlocks,
  getExplorerBlock,
  type Transaction as ExplorerTransaction,
  type ExplorerTransactionsResponse,
  type GetExplorerTransactionsParams,
  type Block as ExplorerBlock,
  type ExplorerBlocksResponse,
  type GetExplorerBlocksParams,
} from "./explorer";

export type {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
  DecryptWalletRequest,
  DecryptWalletResponse,
  GetWalletsParams,
  WalletsListResponse,
  LocalWallet,
  WalletCreationResult,
  WalletBalance,
  TokenBalance,
  WalletTransaction,
} from "@/types/wallet";

export type {
  OrderBookApiOrder,
  ChainOrderBook,
  OrderBookResponse,
  DisplayOrder,
} from "@/types/orderbook";

export type { FeeParams } from "@/types/params";
export { DEFAULT_FEE_PARAMS } from "@/types/params";

export type {
  AddressBookEntry,
  AddressBookListResponse,
  CreateAddressBookEntryRequest,
  UpdateAddressBookEntryRequest,
  GetAddressBookParams,
  SearchAddressBookParams,
  NetworkType,
  ContactLabel,
} from "@/types/address-book";
