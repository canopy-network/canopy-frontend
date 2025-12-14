/**
 * @fileoverview Chain-related type definitions
 *
 * This module contains all TypeScript interfaces and types related to chains,
 * creators, virtual pools, and transactions.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================================================
// CHAIN TYPES
// ============================================================================

/**
 * Chain status enumeration matching the backend values
 */
export type ChainStatus =
  | "draft"
  | "pending_launch"
  | "virtual_active"
  | "graduated"
  | "failed";

/**
 * Main Chain interface matching the /api/v1/chains response
 */
export interface Chain {
  /** Unique identifier for the chain */
  id: string;

  /** Chain name (primary display name) */
  chain_name: string;

  /** Token name (optional, can be same as chain_name) */
  token_name?: string;

  /** Token symbol (uppercase, e.g., "DEFISWAP") */
  token_symbol: string;

  /** Detailed description of the chain */
  chain_description: string;

  /** ID of the template used to create this chain */
  template_id: string;

  /** Consensus mechanism used by the chain */
  consensus_mechanism: string;

  /** Total token supply for the chain */
  token_total_supply: number;

  /** CNPY threshold required for graduation */
  graduation_threshold: number;

  /** Fee in CNPY required to create the chain */
  creation_fee_cnpy: number;

  /** Initial CNPY reserve in the virtual pool */
  initial_cnpy_reserve: number;

  /** Initial token supply in the virtual pool */
  initial_token_supply: number;

  /** Bonding curve slope for price discovery */
  bonding_curve_slope: number;

  /** Scheduled launch time (ISO 8601) */
  scheduled_launch_time?: string;

  /** Actual launch time (ISO 8601, nullable) */
  actual_launch_time: string | null;

  /** Creator's initial CNPY purchase amount */
  creator_initial_purchase_cnpy: number;

  /** Current status of the chain */
  status: ChainStatus;

  /** Whether the chain has graduated to mainnet */
  is_graduated: boolean;

  /** Time when the chain graduated (ISO 8601) */
  graduation_time: string | null;

  /** Chain ID on the network (nullable) */
  chain_id: string | null;

  /** Genesis block hash (nullable) */
  genesis_hash: string | null;

  /** Minimum stake required for validators */
  validator_min_stake: number;

  /** ID of the user who created the chain */
  created_by: string;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;

  /** Template information (included when requested) */
  template?: import("./templates").Template;

  /** Creator information (included when requested) */
  creator?: Creator;

  /** Assets associated with the chain (included when requested) */
  assets?: ChainAsset[];

  /** Virtual pool information (included when requested) */
  virtual_pool?: VirtualPool;

  /** Logo/branding URL (computed from assets) */
  branding?: string;

  /** Banner/screenshot URL (computed from assets) */
  banner?: string;

  /** Media URLs (computed from assets - includes media, screenshots, banners) */
  media?: string[];

  /** Brand color for the chain (hex color code) */
  brand_color?: string;

  /** Genesis supply for the chain */
  genesis_supply?: number;

  /** Block time in seconds */
  block_time_seconds?: number;

  /** Block reward amount */
  block_reward_amount?: number | null;

  /** Halving schedule in blocks */
  halving_schedule?: number | null;

  /** Upgrade block height */
  upgrade_block_height?: number | null;

  /** Graduation progress information */
  graduation?: GraduationProgress;
}

// ============================================================================
// CREATOR/USER TYPES
// ============================================================================

/**
 * Verification tier enumeration
 */
export type VerificationTier =
  | "unverified"
  | "basic"
  | "verified"
  | "premium"
  | "enterprise";

/**
 * Creator/User interface matching the creator object in chain responses
 */
export interface Creator {
  /** Unique identifier for the creator */
  id: string;

  /** Wallet address of the creator */
  wallet_address: string;

  /** Email address (optional) */
  email: string | null;

  /** Username (optional) */
  username: string | null;

  /** Display name for the creator */
  display_name: string;

  /** Bio/description of the creator */
  bio: string | null;

  /** Avatar image URL */
  avatar_url: string | null;

  /** Personal website URL */
  website_url: string | null;

  /** Twitter handle */
  twitter_handle: string | null;

  /** GitHub username */
  github_username: string | null;

  /** Telegram handle */
  telegram_handle: string | null;

  /** Notification preferences (JSON object) */
  notification_preferences: Record<string, any> | null;

  /** Whether the creator is verified */
  is_verified: boolean;

  /** Verification tier level */
  verification_tier: VerificationTier;

  /** Total number of chains created */
  total_chains_created: number;

  /** Total CNPY invested across all chains */
  total_cnpy_invested: number;

  /** Reputation score */
  reputation_score: number;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;

  /** Last active timestamp (ISO 8601) */
  last_active_at: string | null;

  /** Email verified timestamp (ISO 8601) */
  email_verified_at?: string | null;
}

// ============================================================================
// VIRTUAL POOL TYPES
// ============================================================================

/**
 * Transaction type enumeration
 */
export type TransactionType = "buy" | "sell";

/**
 * Virtual Pool interface for trading data
 */
export interface VirtualPool {
  /** Unique identifier for the virtual pool */
  id: string;

  /** ID of the associated chain */
  chain_id: string;

  /** Current CNPY reserve in the pool */
  cnpy_reserve: number;

  /** Current token reserve in the pool */
  token_reserve: number;

  /** Current price per token in CNPY */
  current_price_cnpy: number;

  /** Market cap in USD */
  market_cap_usd: number;

  /** Total trading volume in CNPY */
  total_volume_cnpy: number;

  /** Total number of transactions */
  total_transactions: number;

  /** Number of unique traders */
  unique_traders: number;

  /** Whether the pool is currently active */
  is_active: boolean;

  /** 24-hour price change percentage */
  price_24h_change_percent: number;

  /** 24-hour trading volume in CNPY */
  volume_24h_cnpy: number;

  /** 24-hour high price in CNPY */
  high_24h_cnpy: number;

  /** 24-hour low price in CNPY */
  low_24h_cnpy: number;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;

  /** Initial CNPY reserve in the pool */
  initial_cnpy_reserve?: number;

  /** Initial token supply in the pool */
  initial_token_supply?: number;

  /** Creator's initial CNPY purchase amount */
  creator_initial_purchase_cnpy?: number;
}

/**
 * Transaction interface for trading history
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;

  /** ID of the virtual pool */
  virtual_pool_id: string;

  /** ID of the associated chain */
  chain_id: string;

  /** ID of the user who made the transaction */
  user_id: string;

  /** Type of transaction (buy or sell) */
  transaction_type: TransactionType;

  /** CNPY amount involved in the transaction */
  cnpy_amount: number;

  /** Token amount involved in the transaction */
  token_amount: number;

  /** Price per token at the time of transaction */
  price_per_token_cnpy: number;

  /** Trading fee in CNPY */
  trading_fee_cnpy: number;

  /** Slippage percentage */
  slippage_percent: number;

  /** Transaction hash on the blockchain */
  transaction_hash: string;

  /** Block height when transaction was mined */
  block_height: number;

  /** Gas used for the transaction */
  gas_used: number;

  /** Pool CNPY reserve after the transaction */
  pool_cnpy_reserve_after: number;

  /** Pool token reserve after the transaction */
  pool_token_reserve_after: number;

  /** Market cap after the transaction in USD */
  market_cap_after_usd: number;

  /** Transaction timestamp (ISO 8601) */
  created_at: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create chain request payload
 */
export interface CreateChainRequest {
  chain_name: string;
  token_name: string;
  token_symbol: string;
  chain_description?: string;
  template_id?: string;
  consensus_mechanism?: string;
  token_total_supply?: number;
  graduation_threshold?: number;
  creation_fee_cnpy?: number;
  initial_cnpy_reserve?: number;
  initial_token_supply?: number;
  bonding_curve_slope?: number;
  validator_min_stake?: number;
  creator_initial_purchase_cnpy?: number;
  brand_color?: string;
  block_time_seconds?: number;
  halving_schedule?: number;
  block_reward_amount?: number;
}

/**
 * Query parameters for getting chains
 */
export interface GetChainsParams {
  status?: ChainStatus;
  creator?: string;
  template_id?: string;
  page?: number;
  limit?: number;
  include?: string;
}

/**
 * Query parameters for getting transactions
 */
export interface GetTransactionsParams {
  user_id?: string;
  transaction_type?: TransactionType;
  page?: number;
  limit?: number;
}

// ============================================================================
// ASSET TYPES
// ============================================================================

/**
 * Asset type enumeration
 */
export type AssetType =
  | "logo"
  | "banner"
  | "screenshot"
  | "media"
  | "video"
  | "whitepaper"
  | "documentation";

/**
 * Chain asset from API response
 */
export interface ChainAsset {
  id: string;
  chain_id: string;
  asset_type: AssetType;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  is_featured: boolean;
  is_active: boolean;
  moderation_status: string;
  moderation_notes: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create asset request payload
 */
export interface CreateAssetRequest {
  asset_type: AssetType;
  file_name: string;
  file_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  display_order?: number;
  is_primary?: boolean;
  is_featured?: boolean;
}

// ============================================================================
// SOCIAL LINKS & REPOSITORY TYPES
// ============================================================================

/**
 * Social media platforms supported
 */
export type SocialPlatform =
  | "website"
  | "twitter"
  | "discord"
  | "telegram"
  | "github"
  | "medium"
  | "youtube"
  | "linkedin";

/**
 * Social link interface
 */
export interface SocialLink {
  id: string;
  chain_id: string;
  platform: SocialPlatform;
  url: string;
  display_name: string | null;
  is_verified: boolean;
  follower_count: number;
  last_metrics_update: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Repository connection details
 */
export interface Repository {
  id: string;
  chain_id: string;
  github_url: string;
  repository_name: string;
  repository_owner: string;
  default_branch: string;
  is_connected: boolean;
  auto_upgrade_enabled: boolean;
  upgrade_trigger: "manual" | "automatic" | "tag";
  last_sync_commit_hash: string | null;
  last_sync_time: string | null;
  build_status: "pending" | "success" | "failed" | null;
  last_build_time: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Graduation progress details
 */
export interface GraduationProgress {
  threshold_cnpy: number;
  current_cnpy_reserve: number;
  cnpy_remaining: number;
  completion_percentage: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Chain with included relationships
 */
export type ChainWithRelations = Chain & {
  template: import("./templates").Template;
  creator: Creator;
};

/**
 * Extended Chain type that includes additional optional properties
 * This type is useful for components that handle chains with all related data included
 * via the include parameter (e.g., 'creator,template,assets,graduation,repository,social_links,graduated_pool,virtual_pool')
 */
export type ChainExtended = Chain & {
  /** Graduation progress information */
  graduation?: GraduationProgress;
  /** Virtual pool information (alias for virtual_pool) */
  pool?: VirtualPool;
  /** Social links */
  social_links?: SocialLink[];
  /** Repository information */
  repository?: Repository;
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Chain status labels for UI display
 */
export const CHAIN_STATUS_LABELS: Record<ChainStatus, string> = {
  draft: "Draft",
  pending_launch: "Pending Launch",
  virtual_active: "Virtual Active",
  graduated: "Graduated",
  failed: "Failed",
} as const;

/**
 * Chain status colors for UI styling
 */
export const CHAIN_STATUS_COLORS: Record<ChainStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  pending_launch:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  virtual_active:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  graduated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

/**
 * Chain token is the most atomic data type for a token made for a custom chain.
 * @property {string} symbol, the symbol of the token
 * @property {string} name, the name of the token
 * @property {string} balance, the balance of the token
 * @property {string} balanceUSD, the balance of the token in USD
 * @property {string} icon, the icon of the token
 */
export interface ChainToken {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  icon: string;
}

/**
 * Canopy wallet interface matching the /api/v1/wallet response
 * @property {number} cnpyAvailableAmount, the max amount of Canopy available on the wallet
 * @property {number} usdCurrentPrice, the current price of Canopy but in  Usd
 */
export interface CanopyWallet {
  cnpyAvailableAmount: number;
  usdCurrentPrice: number;
}

/**
 * Chain holder information from /api/v1/chains/{id}/holders
 */
export interface ChainHolder {
  user_id: string;
  account_name: string;
  wallet_address: string;
  token_balance: number;
  percentage: number;
  value_cnpy: number;
  average_entry_price_cnpy: number;
  unrealized_pnl_cnpy: number;
  total_return_percent: number;
  first_purchase_at: string;
  last_activity_at: string;
}

/**
 * Query parameters for getting holders
 */
export interface GetHoldersParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// ACCOLADES TYPES
// ============================================================================

/**
 * Accolade category enumeration
 */
export type AccoladeCategory = "holder" | "market_cap" | "transaction";

/**
 * Accolade interface matching the /api/v1/chains/{id}/accolades response
 */
export interface Accolade {
  /** Unique identifier for the accolade */
  name: string;
  /** Display name for the accolade */
  display_name: string;
  /** Description of what the accolade represents */
  description: string;
  /** Category of the accolade */
  category: AccoladeCategory;
  /** Threshold value required to earn this accolade */
  threshold: number;
  /** Current value for this accolade metric */
  current_value: number;
  /** Whether this accolade has been earned */
  is_earned: boolean;
  /** Timestamp when the accolade was earned (null if not earned) */
  earned_at: string | null;
}

/**
 * Chain Height Information
 */
export interface ChainHeight {
  chain_id: string;
  height: number;
}
