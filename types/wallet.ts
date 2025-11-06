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
  id: string;                      // UUID
  user_id?: string;                // UUID (optional)
  chain_id?: string;               // UUID (optional)
  created_by: string;              // UUID (user who created the wallet)
  wallet_name?: string;            // Optional name (1-100 chars)
  wallet_description?: string;     // Optional description (max 500 chars)
  address: string;                 // Blockchain address
  public_key: string;              // Hex-encoded public key
  encrypted_private_key: string;   // AES-encrypted private key (never exposed)
  salt: string;                    // Salt for key derivation (never exposed)
  is_active: boolean;              // Active status
  is_locked: boolean;              // Locked status (from failed attempts)
  locked_until?: string;           // ISO timestamp for temporary lock expiration
  failed_decrypt_attempts: number; // Number of failed decryption attempts (never exposed)
  last_used_at?: string;           // ISO timestamp
  password_changed_at?: string;    // ISO timestamp
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
}

/**
 * Request to create a new wallet
 */
export interface CreateWalletRequest {
  password: string;                // Min 8 characters
  user_id?: string;                // UUID (optional, backend uses session)
  chain_id?: string;               // UUID (optional)
  wallet_name?: string;            // Optional (1-100 chars)
  wallet_description?: string;     // Optional (max 500 chars)
}

/**
 * Address map for importing wallet
 */
export interface AddressMap {
    publicKey: string;
    salt: string;
    encrypted: string;
    keyAddress: string;
    keyNickName: string;
}

/**
 * Request to import a new wallet
 */
export interface ImportWalletRequest {
    addressMap: {
        [key: string]: AddressMap | string
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
  wallet_name?: string;            // Optional (1-100 chars)
  wallet_description?: string;     // Optional (max 500 chars)
  is_active?: boolean;             // Optional
}

/**
 * Request to decrypt wallet private key
 */
export interface DecryptWalletRequest {
  password: string;                // Password used during wallet creation
}

/**
 * Response from decrypting wallet
 */
export interface DecryptWalletResponse {
  private_key: string;             // Hex-encoded decrypted private key
  public_key: string;              // Hex-encoded public key
  address: string;                 // Blockchain address
}

/**
 * Query parameters for listing wallets
 */
export interface GetWalletsParams {
  user_id?: string;                // Filter by user
  chain_id?: string;               // Filter by chain
  created_by?: string;             // Filter by creator
  is_active?: boolean;             // Filter by active status
  is_locked?: boolean;             // Filter by locked status
  page?: number;                   // Page number (default: 1, min: 1)
  limit?: number;                  // Page size (default: 20, min: 1, max: 100)
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
 * Local wallet state (includes decrypted keys temporarily)
 */
export interface LocalWallet extends Wallet {
  privateKey?: string;             // Temporarily stored after unlock (in memory only)
  isUnlocked?: boolean;            // Whether wallet is currently unlocked
}

/**
 * Wallet creation result (includes seedphrase)
 */
export interface WalletCreationResult {
  wallet: Wallet;
  seedphrase: string;              // 12-word mnemonic (NEVER send to backend)
}

/**
 * Wallet balance (for UI display)
 */
export interface WalletBalance {
  total: string;                   // Total balance in main token
  tokens: TokenBalance[];          // Individual token balances
}

/**
 * Token balance
 */
export interface TokenBalance {
  symbol: string;                  // Token symbol (e.g., "CNPY", "ETH")
  name: string;                    // Token name
  balance: string;                 // Balance amount
  usdValue?: string;               // USD value (optional)
  logo?: string;                   // Token logo URL (optional)
}

/**
 * Wallet transaction (for display)
 */
export interface WalletTransaction {
  id: string;
  type: 'send' | 'receive' | 'stake' | 'unstake' | 'swap';
  amount: string;
  token: string;
  from?: string;                   // Sender address
  to?: string;                     // Recipient address
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;               // ISO timestamp
  txHash?: string;                 // Transaction hash
}

/**
 * Export wallet response (keystore format)
 */
export interface ExportWalletResponse {
  addressMap: {
    [address: string]: {
      publicKey: string;           // Hex-encoded public key
      salt: string;                // Hex-encoded salt for encryption
      encrypted: string;           // Hex-encoded encrypted private key
      keyAddress: string;          // Blockchain address
      keyNickName: string;         // Wallet nickname
    };
  };
}
