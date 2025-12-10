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
// WALLET TYPES (Backend Integration)
// ============================================================================

export interface SessionToken {
  id: string;
  user_id: string;
  token_prefix: string;
  user_agent?: string;
  ip_address?: string;
  device_name?: string;
  expires_at: string;
  last_used_at: string;
  is_revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  message: string;
  expires_at: string;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface VerifyOTPResponse {
  token: string;
  user: User;
  session: SessionToken;
}

export interface Wallet {
  id: string;
  user_id?: string;
  chain_id?: number;
  address: string;
  public_key: string;
  wallet_name?: string;
  wallet_description?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KeystoreAccount {
  publicKey: string;
  salt: string;
  encrypted: string;
  keyAddress: string;
  keyNickname: string;
}

export interface ImportWalletsRequest {
  addressMap: Record<string, KeystoreAccount>;
  chain_id?: number;
}

export interface ImportWalletResult {
  address: string;
  success: boolean;
  wallet_id?: string;
  error?: string;
}

export interface ImportWalletsResponse {
  results: ImportWalletResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface ExportWalletsResponse {
  addressMap: Record<string, KeystoreAccount>;
}

export interface UpdateWalletRequest {
  wallet_name?: string;
  wallet_description?: string;
  is_active?: boolean;
}

// ============================================================================
// PORTFOLIO TYPES (Backend Integration)
// ============================================================================

export interface PortfolioAccount {
  address: string;
  label?: string;
  chain_id: number;
  chain_name: string;
  token_symbol: string;
  balance: string;
  balance_usd?: string;
  staked_balance: string;
  staked_usd?: string;
  delegated_balance: string;
  delegated_usd?: string;
  available_balance: string;
  available_usd?: string;
}

export interface AssetTypeDetail {
  value_cnpy: string;
  value_usd?: string;
  percentage: number;
}

export interface TypeAllocation {
  liquid: AssetTypeDetail;
  staked: AssetTypeDetail;
  delegated: AssetTypeDetail;
}

export interface ChainAllocation {
  chain_id: number;
  chain_name: string;
  token_symbol: string;
  value_cnpy: string;
  value_usd?: string;
  percentage: number;
}

export interface PortfolioAllocation {
  by_chain: ChainAllocation[];
  by_type: TypeAllocation;
}

export interface PortfolioPerformance {
  total_pnl_percentage: number;
  period: string;
}

export interface PortfolioOverviewRequest {
  addresses: string[];
  include_watch_only?: boolean;
  height?: number;
}

export interface PortfolioOverviewResponse {
  total_value_cnpy: string;
  total_value_usd?: string;
  accounts: PortfolioAccount[];
  allocation: PortfolioAllocation;
  performance: PortfolioPerformance;
  last_updated: string;
}

export interface LPPosition {
  pool_id: string;
  chain_id: number;
  liquidity_points: string;
  estimated_value_cnpy: string;
  share_percentage: number;
}

export interface DetailedAccountBalance {
  address: string;
  chain_id: number;
  chain_name: string;
  token_symbol: string;
  height: number;
  liquid_balance: string;
  staked_balance: string;
  delegated_balance: string;
  lp_positions: LPPosition[];
  total_balance: string;
}

export interface AccountBalancesRequest {
  addresses: string[];
  chain_ids?: number[];
  height?: number;
}

export interface AccountBalancesResponse {
  balances: DetailedAccountBalance[];
}

export interface PerformanceDataPoint {
  timestamp: string;
  value_cnpy: string;
  value_usd?: string;
}

export interface PortfolioPerformanceRequest {
  addresses: string[];
  period: "24h" | "7d" | "30d" | "90d" | "1y" | "all";
  granularity: "hourly" | "daily" | "weekly" | "monthly";
}

export interface PortfolioPerformanceResponse {
  data_points: PerformanceDataPoint[];
  total_pnl_cnpy: string;
  total_pnl_usd?: string;
  total_pnl_percentage: number;
  period: string;
}

// ============================================================================
// STAKING TYPES (Backend Integration)
// ============================================================================

export interface StakingPosition {
  address: string;
  public_key: string;
  chain_id: number;
  chain_name?: string;
  staked_amount: string;
  staked_cnpy: string;
  status: "active" | "paused" | "unstaking";
  committees?: number[];
  delegate: boolean;
  compound: boolean;
  output_address?: string;
  total_rewards?: string;
  total_rewards_cnpy?: string;
  time_staked?: string;
  unstaking_height?: number;
  max_paused_height?: number;
  updated_at: string;
}

export interface ChainStats {
  chain_id: number;
  validator_count: number;
}

export interface StakingPositionsRequest {
  address?: string;
  chain_ids?: string;
  status?: "active" | "paused" | "unstaking";
  limit?: number;
  offset?: number;
}

export interface StakingPositionsResponse {
  positions: StakingPosition[];
  metadata: {
    total: number;
    has_more: boolean;
    limit: number;
    offset: number;
    chain_stats: ChainStats[];
  };
}

export interface ValidatorReward {
  address: string;
  chain_id: number;
  chain_name?: string;
  total_rewards: string;
  total_rewards_cnpy: string;
  claimable_rewards: string;
  claimable_cnpy: string;
  last_claim_time?: string;
  reward_count: number;
  status: string;
}

export interface StakingRewardsRequest {
  address?: string;
  chain_ids?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface StakingRewardsResponse {
  rewards: ValidatorReward[];
  total_rewards: string;
  total_cnpy: string;
  metadata: {
    total: number;
    has_more: boolean;
    limit: number;
    offset: number;
    chain_stats: ChainStats[];
  };
}

export interface UnstakingEntry {
  address: string;
  chain_id: number;
  chain_name?: string;
  unstaking_amount: string;
  unstaking_cnpy: string;
  unstaking_height: number;
  current_height: number;
  blocks_remaining: number;
  estimated_completion: string;
  time_remaining: string;
  unstake_initiated_time: string;
  status: "unstaking" | "ready";
}

export interface UnstakingQueueRequest {
  address?: string;
  chain_ids?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface UnstakingQueueResponse {
  queue: UnstakingEntry[];
  metadata: {
    total: number;
    has_more: boolean;
    limit: number;
    offset: number;
    chain_stats: ChainStats[];
  };
}

// ============================================================================
// TRANSACTION TYPES (Backend Integration)
// ============================================================================

export interface SendRawTransactionRequest {
  raw_transaction: Record<string, any>;
}

export interface SendRawTransactionResponse {
  transaction_hash: string;
  status: string;
  submitted_at: string;
}

export interface EstimateFeeRequest {
  transaction_type: string;
  from_address: string;
  to_address?: string;
  amount?: string;
  chain_id: number;
}

export interface EstimateFeeResponse {
  estimated_fee: number;
  fee_unit: string;
}

export interface TransactionDetail {
  hash: string;
  chain_id: number;
  chain_name: string;
  token_symbol: string;
  type: string;
  from_address: string;
  to_address?: string;
  amount?: string;
  amount_usd?: string;
  fee: string;
  status: "completed" | "pending" | "failed";
  block_height?: number;
  timestamp: string;
  confirmations: number;
  memo?: string;
  user_label?: string;
  category?: string;
}

export interface TransactionHistoryRequest {
  addresses: string[];
  chain_ids?: number[];
  transaction_types?: string[];
  start_date?: string;
  end_date?: string;
  page: number;
  limit: number;
  sort: "asc" | "desc";
}

export interface TransactionHistoryResponse {
  transactions: TransactionDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PendingTransactionsRequest {
  addresses: string[];
  chain_ids?: number[];
}

export interface PendingTransactionsResponse {
  transactions: TransactionDetail[];
}

export interface TransactionStatusResponse {
  hash: string;
  status: string;
  confirmations: number;
  block_height?: number;
}

export interface BatchStatusRequest {
  transaction_hashes: string[];
}

export interface BatchStatusResponse {
  statuses: TransactionStatusResponse[];
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

// Re-export AddressResponse from addresses module for convenience
import type { AddressResponse } from "./addresses";
export type { AddressResponse };

/**
 * Address information for UI components
 */
export interface AddressInfo {
  address: string;
  createdAt: Date;
  portfolioValue: number;
  change24h: {
    absolute: number;
    percentage: number;
  };
  staked: {
    value: number;
    free: number;
  };
  apiData?: AddressResponse; // Full API response for components that need it
  cnpyTotal: number;
}
