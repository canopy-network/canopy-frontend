/**
 * @fileoverview Address-related type definitions for the Explorer API
 *
 * This module contains all types related to blockchain addresses, including
 * address summaries, balances, LP positions, validator information, and transactions.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================================================
// ADDRESS TYPES
// ============================================================================

/**
 * Address summary information
 */
export interface AddressSummary {
  total_portfolio_value_cnpy: number;
  total_portfolio_value_fmt: string;
  liquid_balance_cnpy: number;
  staked_balance_cnpy: number;
  lp_balance_cnpy: number;
  chain_count: number;
  lp_position_count: number;
  is_validator: boolean;
  validator_chain_count: number;
}

/**
 * Address balance information
 */
export interface AddressBalance {
  chain_id: number;
  chain_name: string;
  balance: number;
  balance_fmt: string;
  height: number;
  updated_at: string;
}

/**
 * LP position information
 */
export interface AddressLPPosition {
  chain_id: number;
  chain_name: string;
  pool_id: number;
  points: number;
  total_points: number;
  share_percentage: number;
  estimated_value_cnpy: number;
  estimated_value_fmt: string;
  pool_total_amount: number;
  height: number;
  updated_at: string;
}

/**
 * Validator information by chain
 */
export interface ValidatorByChain {
  chain_id: number;
  chain_name: string;
  staked_amount: number;
  staked_amount_fmt: string;
  status: string;
  delegate: boolean;
  compound: boolean;
  committees: number[];
  updated_at: string;
}

/**
 * Validator information
 */
export interface AddressValidatorInfo {
  total_staked_cnpy: number;
  total_staked_fmt: string;
  validators_by_chain: ValidatorByChain[];
}

/**
 * Transaction in address response
 */
export interface AddressTransaction {
  tx_hash: string;
  type: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  height: number;
  timestamp: string;
  success: boolean;
}

/**
 * Transactions by chain
 */
export interface TransactionsByChain {
  chain_id: number;
  chain_name: string;
  total: number;
  transactions: AddressTransaction[];
}

/**
 * Address API response
 */
export interface AddressResponse {
  address: string;
  summary: AddressSummary;
  balances: AddressBalance[];
  lp_positions: AddressLPPosition[];
  validator_info?: AddressValidatorInfo;
  transactions?: TransactionsByChain[];
  account_creation?: any[];
}
