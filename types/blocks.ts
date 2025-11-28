/**
 * @fileoverview Block-related type definitions for the Explorer API
 *
 * This module contains all types related to blockchain blocks, including
 * block data structures, search results, and query parameters.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================================================
// BLOCK TYPES
// ============================================================================

/**
 * Explorer block response from API
 */
export interface Block {
  chain_id: number;
  height: number;
  hash: string;
  timestamp: string;
  proposer_address: string;
  num_txs: number;
  num_events: number;
  total_fees: number;
}

/**
 * Explorer blocks response with pagination
 */
export interface ExplorerBlocksResponse {
  data: Block[];
  pagination: {
    limit: number;
    next_cursor: number | null;
  };
}

/**
 * Query parameters for getting blocks
 */
export interface GetExplorerBlocksParams {
  chain_id?: number;
  limit?: number;
  cursor?: number;
  sort?: "asc" | "desc";
}

/**
 * Explorer block search result data
 */
export interface ExplorerBlockSearchResult {
  type: "block";
  chain_id: number;
  result: {
    chain_id: number;
    height: number;
    hash: string;
    timestamp: string;
    proposer_address: string;
    num_txs_send?: number;
    num_txs_stake?: number;
    num_txs_edit_stake?: number;
    num_txs_unstake?: number;
    num_txs_pause?: number;
    num_txs_unpause?: number;
    num_txs_change_parameter?: number;
    num_txs_dao_transfer?: number;
    num_txs_certificate_result?: number;
    num_txs_subsidy?: number;
    num_txs_create_order?: number;
    num_txs_edit_order?: number;
    num_txs_delete_order?: number;
    num_txs_dex_deposit?: number;
    num_txs_dex_withdraw?: number;
    num_txs_dex_limit_order?: number;
    num_events_reward?: number;
    num_events_slash?: number;
    num_events_double_sign?: number;
    num_events_unstake_ready?: number;
    num_events_order_book_swap?: number;
    num_events_order_created?: number;
    num_events_order_edited?: number;
    num_events_order_deleted?: number;
    num_events_order_filled?: number;
    num_events_dex_deposit?: number;
    num_events_dex_withdraw?: number;
    num_events_dex_swap?: number;
    num_events_pool_created?: number;
    num_events_pool_points_created?: number;
    num_events_pool_points_redeemed?: number;
    num_events_pool_points_transfered?: number;
    num_orders_created?: number;
    num_orders_edited?: number;
    num_orders_deleted?: number;
    total_txs?: number;
    total_events?: number;
    total_fees?: number;
  };
}
