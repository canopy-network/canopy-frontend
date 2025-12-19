/**
 * Wallet types for Canopy frontend
 *
 * Based on backend API specification from:
 * https://github.com/canopy-network/launchpad/blob/main/docs/endpoints/wallet-endpoints.md
 */

/**
 * Wallet object returned by backend
 */
export interface Wallet {
  id: string; // UUID
  user_id?: string; // UUID (optional)
  chain_id?: string; // UUID (optional)
  created_by: string; // UUID (user who created the wallet)
  wallet_name?: string; // Optional name (1-100 chars)
  wallet_description?: string; // Optional description (max 500 chars)
  address: string; // Blockchain address
  public_key: string; // Hex-encoded public key
  encrypted_private_key: string; // AES-encrypted private key (never exposed)
  salt: string; // Salt for key derivation (never exposed)
  is_active: boolean; // Active status
  is_locked: boolean; // Locked status (from failed attempts)
  locked_until?: string; // ISO timestamp for temporary lock expiration
  failed_decrypt_attempts: number; // Number of failed decryption attempts (never exposed)
  last_used_at?: string; // ISO timestamp
  password_changed_at?: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Request to create a new wallet
 */
export interface CreateWalletRequest {
  password: string; // Min 8 characters
  user_id?: string; // UUID (optional, backend uses session)
  chain_id?: string; // UUID (optional)
  wallet_name?: string; // Optional (1-100 chars)
  wallet_description?: string; // Optional (max 500 chars)
}

/**
 * Address map for importing wallet
 */
export interface AddressMap {
  publicKey: string;
  salt: string;
  encrypted: string;
  keyAddress: string;
  keyNickName?: string; // Optional for backwards compatibility
  keyNickname?: string; // New format from backend
}

/**
 * Request to import a new wallet
 */
export interface ImportWalletRequest {
  addressMap: {
    [key: string]: AddressMap | string;
  };
}

/**
 * Response from importing wallets
 */
export interface ImportWalletResponse {
  results: Array<{
    address: string;
    success: boolean;
    wallet_id: string;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Request to update wallet metadata
 */
export interface UpdateWalletRequest {
  wallet_name?: string; // Optional (1-100 chars)
  wallet_description?: string; // Optional (max 500 chars)
  is_active?: boolean; // Optional
}

/**
 * Request to decrypt wallet private key
 */
export interface DecryptWalletRequest {
  password: string; // Password used during wallet creation
}

/**
 * Response from decrypting wallet
 */
export interface DecryptWalletResponse {
  private_key: string; // Hex-encoded decrypted private key
  public_key: string; // Hex-encoded public key
  address: string; // Blockchain address
}

/**
 * Query parameters for listing wallets
 */
export interface GetWalletsParams {
  user_id?: string; // Filter by user
  chain_id?: string; // Filter by chain
  created_by?: string; // Filter by creator
  is_active?: boolean; // Filter by active status
  is_locked?: boolean; // Filter by locked status
  page?: number; // Page number (default: 1, min: 1)
  limit?: number; // Page size (default: 20, min: 1, max: 100)
}

/**
 * Paginated response for wallet list
 */
export interface WalletsListResponse {
  data: Wallet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Local wallet state (minimal fields from export endpoint)
 * Only includes fields actually provided by the export endpoint
 *
 * SECURITY NOTE:
 * - privateKey is NEVER persisted to localStorage
 * - privateKey is recalculated each time by decrypting encrypted_private_key
 * - privateKey only exists in memory while wallet is unlocked
 * - On page refresh, all wallets reset to locked state
 */
export interface LocalWallet {
  // From export endpoint (persisted to localStorage)
  id: string; // Wallet address (used as ID)
  address: string; // Blockchain address (keyAddress)
  public_key: string; // Hex-encoded public key
  encrypted_private_key: string; // AES-encrypted private key
  salt: string; // Salt for key derivation
  wallet_name: string; // Wallet nickname (keyNickname)
  curveType?: string; // Curve type (ed25519, bls12381, secp256k1, ethsecp256k1)

  // Local state only (in-memory, NEVER persisted)
  privateKey?: string; // Decrypted private key (recalculated on unlock)
  isUnlocked?: boolean; // Whether wallet is currently unlocked
}

/**
 * Wallet creation result (includes seedphrase)
 */
export interface WalletCreationResult {
  wallet: Wallet;
  seedphrase: string; // 12-word mnemonic (NEVER send to backend)
}

/**
 * Wallet balance (for UI display)
 */
export interface WalletBalance {
  total: string; // Total balance in main token
  tokens: TokenBalance[]; // Individual token balances
}

/**
 * Token balance distribution
 */
export interface TokenDistribution {
  liquid: string; // Liquid/available balance
  staked: string; // Staked balance
  delegated: string; // Delegated balance
}

/**
 * Token balance
 */
export interface TokenBalance {
  symbol: string; // Token symbol (e.g., "C001", "C002" for chains)
  name: string; // Token name (chain name)
  balance: string; // Total balance amount
  usdValue?: string; // USD value (optional)
  logo?: string; // Token logo URL (optional)
  chainId?: number; // Chain ID (for chain-based tokens)
  distribution?: TokenDistribution; // Balance distribution (liquid, staked, delegated)
}

/**
 * Portfolio API Request/Response Types
 * Based on https://github.com/canopy-network/launchpad/blob/main/internal/handlers/portfolio.go
 */

/**
 * Request for portfolio overview
 */
export interface PortfolioOverviewRequest {
  addresses: string[]; // Wallet addresses to query
  include_watch_only?: boolean; // Include watch-only accounts
  height?: number; // Blockchain height reference
}

/**
 * Request for account balances
 */
export interface AccountBalancesRequest {
  addresses: string[]; // Target wallet addresses
  chain_ids?: string[] | number[]; // Specific chains to query
  height?: number; // Blockchain height
}

/**
 * Request for portfolio performance
 */
export interface PortfolioPerformanceRequest {
  addresses: string[]; // Wallet addresses
  period?: string; // Timeframe: "24h", "7d", "30d", "90d", "1y", "all"
  granularity?: string; // Data frequency: "hourly", "daily", "weekly", "monthly"
}

/**
 * Request for asset allocation
 */
export interface AssetAllocationRequest {
  addresses: string[]; // Wallet addresses
  group_by?: string[]; // Aggregation: "chain", "asset_type", "protocol"
}

/**
 * Request for multi-chain balance
 */
export interface MultiChainBalanceRequest {
  addresses: string[]; // Wallet addresses
}

/**
 * Portfolio account details (from overview endpoint)
 */
export interface PortfolioAccount {
  address: string;
  chain_id: number; // Chain ID as number
  chain_name: string; // Chain name
  token_symbol: string; // Token symbol (e.g., "CNPY", "DEFI")
  balance: string; // Total balance (in micro units)
  staked_balance: string; // Staked balance (in micro units)
  delegated_balance: string; // Delegated balance (in micro units)
  available_balance: string; // Available/liquid balance (in micro units)
}

/**
 * Chain allocation item (by_chain)
 */
export interface ChainAllocationItem {
  chain_id: number;
  chain_name: string;
  total_value_cnpy: string; // Total value in micro units
  percentage: number; // Percentage of total portfolio
}

/**
 * Type allocation (by_type)
 */
export interface TypeAllocation {
  liquid: {
    value_cnpy: string; // Value in micro units
    percentage: number;
  };
  staked: {
    value_cnpy: string; // Value in micro units
    percentage: number;
  };
  delegated: {
    value_cnpy: string; // Value in micro units
    percentage: number;
  };
}

/**
 * Portfolio allocation
 */
export interface PortfolioAllocation {
  by_chain: ChainAllocationItem[];
  by_type: TypeAllocation;
}

/**
 * Portfolio performance
 */
export interface PortfolioPerformance {
  total_pnl_percentage: number;
  period: string;
}

/**
 * Performance data point
 */
export interface PerformanceDataPoint {
  timestamp: string;
  value_cnpy: string;
  value_usd?: string;
}

/**
 * Transaction summary
 */
export interface TransactionsSummary {
  total_inflows_cnpy: string;
  total_outflows_cnpy: string;
  net_flow_cnpy: string;
}

/**
 * DEX swap P&L details
 */
export interface DexSwapPnL {
  total_swaps: number;
  successful_swaps: number;
  failed_swaps: number;
  total_sold_cnpy: string;
  total_bought_cnpy: string;
  net_pnl_cnpy: string;
  avg_execution_ratio: number;
}

/**
 * LP position P&L details
 */
export interface LpPositionPnL {
  total_deposits: number;
  total_withdrawals: number;
  total_deposited_cnpy: string;
  total_withdrawn_cnpy: string;
  realized_pnl_cnpy: string;
  unrealized_pnl_cnpy: string;
  net_pnl_cnpy: string;
  total_points_held: string;
}

/**
 * Yield earnings details
 */
export interface YieldEarnings {
  total_yield_cnpy: string;
  staking_rewards_cnpy: string;
  lp_fees_cnpy: string;
  staking_apy: number;
  lp_apy: number;
  blended_apy: number;
}

/**
 * Yield info from overview
 */
export interface YieldInfo {
  total_earnings_cnpy: string;
  blended_apy: number;
  staking_earnings: {
    total_cnpy: string;
    apy: number;
    position_count: number;
  };
  lp_fee_earnings: {
    total_cnpy: string;
    apy: number;
    position_count: number;
  };
}

/**
 * Chain allocation with token symbol
 */
export interface ChainAllocation {
  chain_id: number;
  chain_name: string;
  token_symbol: string;
  total_value_cnpy: string;
  percentage: number;
}

/**
 * Portfolio overview response
 */
export interface PortfolioOverviewResponse {
  total_value_cnpy: string;
  total_value_usd?: string;
  accounts: PortfolioAccount[];
  allocation: {
    by_chain: ChainAllocation[];
    by_type: TypeAllocation;
  };
  performance: PortfolioPerformance;
  yield: YieldInfo;
  last_updated: string;
}

/**
 * Detailed account balance
 * Based on actual API response structure
 */
export interface DetailedAccountBalance {
  address: string; // Wallet address
  chain_id: number; // Chain ID (numeric)
  chain_name: string; // Chain name
  token_symbol: string; // Token symbol (e.g., "C001", "C002" for chains)
  height: number; // Blockchain height
  liquid_balance: string; // Available balance (in uCNPY)
  staked_balance: string; // Staked balance (in uCNPY)
  delegated_balance: string; // Delegated balance (in uCNPY)
  lp_positions: any[] | null; // Liquidity provider positions
  total_balance: string; // Total balance (in uCNPY)
}

/**
 * Detailed token balance
 */
export interface DetailedTokenBalance {
  symbol: string;
  name: string;
  balance: string;
  value_cnpy: string;
  value_usd?: string;
  decimals: number;
  contract_address?: string;
}

/**
 * Account balances response
 * Wraps balances array in a data object
 */
export interface AccountBalancesResponse {
  balances: DetailedAccountBalance[];
}

/**
 * Portfolio performance response
 */
export interface PortfolioPerformanceResponse {
  period: string;
  start_date: string;
  end_date: string;
  starting_value_cnpy: string;
  ending_value_cnpy: string;
  total_pnl_cnpy: string;
  total_pnl_percentage: number;
  realized_pnl_cnpy: string;
  unrealized_pnl_cnpy: string;
  dex_swap_pnl: DexSwapPnL;
  lp_position_pnl: LpPositionPnL;
  time_series: PerformanceDataPoint[];
  transactions_summary: TransactionsSummary;
  yield_earnings: YieldEarnings;
}

/**
 * Asset allocation group
 */
export interface AssetAllocationGroup {
  group_name: string;
  items: AllocationItem[];
}

/**
 * Asset allocation response
 */
export interface AssetAllocationResponse {
  groups: AssetAllocationGroup[];
  total_value_cnpy: string;
  total_value_usd?: string;
}

/**
 * Chain balance
 */
export interface ChainBalance {
  chain_id: string;
  chain_name: string;
  balance_cnpy: string;
  balance_usd?: string;
  accounts: number;
}

/**
 * Multi-chain balance response
 */
export interface MultiChainBalanceResponse {
  chains: ChainBalance[];
  total_value_cnpy: string;
  total_value_usd?: string;
}

export type WalletTransactionStatus = "pending" | "completed" | "failed";
/**
 * Wallet transaction (for display)
 */
export interface WalletTransaction {
  id: string;
  type: "send" | "receive" | "stake" | "unstake" | "swap";
  amount: string;
  token: string;
  from?: string; // Sender address
  to?: string; // Recipient address
  status: WalletTransactionStatus;
  timestamp: string; // ISO timestamp
  txHash?: string; // Transaction hash
}

/**
 * Transaction API Types
 * Based on https://github.com/canopy-network/launchpad/blob/main/internal/handlers/transaction.go
 */

/**
 * Request to send a transaction
 */
export interface SendTransactionRequest {
  from_address: string; // Sender address (required)
  to_address: string; // Recipient address (required)
  amount: string; // Amount to send (required)
  network_id: number; // Network ID (required)
  chain_id: number; // Chain ID
  password: string; // Wallet password for signing (required)
  fee?: number; // Transaction fee (optional)
  memo?: string; // Transaction memo (optional)
}

/**
 * Response from sending a transaction
 */
export interface SendTransactionResponse {
  transaction_hash: string; // Transaction hash
  status: string; // Transaction status
  from_address: string; // Sender address
  to_address: string; // Recipient address
  amount: string; // Amount sent
  fee: string; // Fee charged
  chain_id: number; // Chain ID
  submitted_at: string; // ISO timestamp
}

/**
 * Request to estimate transaction fee
 */
export interface EstimateFeeRequest {
  transaction_type: string; // Type of transaction (required)
  from_address?: string; // Sender address (optional)
  to_address?: string; // Recipient address (optional)
  amount?: string; // Amount (optional)
  chain_id?: number; // Chain ID (optional)
}

/**
 * Fee parameters for different transaction types
 */
export interface FeeParameters {
  message_send_fee: number;
  message_change_parameter_fee: number;
  message_delegate_fee: number;
  message_undelegate_fee: number;
}

/**
 * Response from fee estimation
 */
export interface EstimateFeeResponse {
  estimated_fee: string; // Estimated fee amount
  fee_parameters: FeeParameters; // Detailed fee parameters
  chain_id: number; // Chain ID
}

/**
 * Request for transaction history
 */
export interface TransactionHistoryRequest {
  addresses?: string[]; // Filter by addresses
  chain_ids?: number[]; // Filter by chain IDs
  transaction_types?: string[]; // Filter by transaction types
  start_date?: string; // Start date (ISO timestamp)
  end_date?: string; // End date (ISO timestamp)
  page?: number; // Page number
  limit?: number; // Results per page
  sort?: string; // Sort order
}

/**
 * Detailed transaction information
 */
export interface TransactionDetail {
  transaction_hash: string;
  type: string;
  from_address: string;
  to_address: string;
  amount: string;
  fee: string;
  status: string;
  chain_id: number;
  block_height?: number;
  timestamp: string;
  memo?: string;
  error?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Response from transaction history request
 */
export interface TransactionHistoryResponse {
  transactions: TransactionDetail[];
  pagination: PaginationMetadata;
}

/**
 * Request to send raw transaction
 *
 * The raw_transaction object should contain a fully signed transaction
 * in the format expected by the Canopy blockchain:
 * - type: transaction type (e.g., "send", "stake", "createOrder")
 * - msg: message payload
 * - signature: { publicKey: string, signature: string }
 * - time: microsecond timestamp
 * - createdHeight: blockchain height
 * - fee: transaction fee
 * - memo: optional memo
 * - networkID: network identifier
 * - chainID: chain identifier
 */
export interface SendRawTransactionRequest {
  raw_transaction: {
    type: string;
    msg: Record<string, any>;
    signature: {
      publicKey: string;
      signature: string;
    };
    time: number;
    createdHeight: number;
    fee: number;
    memo: string;
    networkID: number;
    chainID: number;
  };
  chain_id?: number;
}

/**
 * Response from sending raw transaction
 */
export interface SendRawTransactionResponse {
  transaction_hash: string;
  status: string;
  submitted_at: string;
}

/**
 * Request for pending transactions
 */
export interface PendingTransactionsRequest {
  addresses: string[]; // Addresses to check for pending transactions
  chain_ids?: number[]; // Optional chain ID filter
}

/**
 * Response for pending transactions
 */
export interface PendingTransactionsResponse {
  transactions: TransactionDetail[];
}

/**
 * Request for batch transaction status
 */
export interface BatchStatusRequest {
  transaction_hashes: string[]; // List of transaction hashes
  chain_id?: number; // Optional chain ID
}

/**
 * Batch status result for a single transaction
 */
export interface BatchStatusResult {
  transaction_hash: string;
  status: string;
  error?: string;
}

/**
 * Response for batch transaction status
 */
export interface BatchStatusResponse {
  results: BatchStatusResult[];
}

/**
 * Export wallet response (keystore format)
 * Backend returns: { data: { addressMap: {...} } }
 */
export interface ExportWalletResponse {
  addressMap: {
    [address: string]: {
      publicKey: string; // Hex-encoded public key
      salt: string; // Hex-encoded salt for encryption
      encrypted: string; // Hex-encoded encrypted private key
      keyAddress: string; // Blockchain address
      keyNickname: string; // Wallet nickname (lowercase 'n')
    };
  };
}
