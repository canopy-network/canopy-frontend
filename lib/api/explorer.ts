/**
 * Explorer API Client
 *
 * Provides blockchain explorer functionality including blocks and chain information.
 */

import { apiClient } from "./client";

/**
 * Block information from the blockchain
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
 * Pagination info for block queries
 */
export interface BlocksPagination {
  limit: number;
  next_cursor: number;
}

/**
 * Response from blocks endpoint
 */
export interface BlocksResponse {
  data: Block[];
  pagination: BlocksPagination;
}

/**
 * Explorer API methods
 */
export const explorerApi = {
  /**
   * Get blocks from the blockchain
   * GET /api/v1/explorer/blocks
   *
   * @param chainId - Chain ID to query (defaults to 1 - root chain)
   * @param limit - Number of blocks to return (defaults to 20, max 100)
   * @param sort - Sort order: "asc" or "desc" (defaults to "desc")
   * @param cursor - Pagination cursor
   * @returns Blocks response with pagination
   */
  getBlocks: async (
    chainId: number = 1,
    limit: number = 20,
    sort: "asc" | "desc" = "desc",
    cursor?: number
  ): Promise<BlocksResponse> => {
    const params = new URLSearchParams({
      chain_id: chainId.toString(),
      limit: limit.toString(),
      sort,
    });

    if (cursor !== undefined) {
      params.append("cursor", cursor.toString());
    }

    const response = await apiClient.get<BlocksResponse>(
      `/api/v1/explorer/blocks?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get the latest block height for a chain
   * Convenience method that fetches the most recent block
   *
   * @param chainId - Chain ID to query (defaults to 1 - root chain)
   * @returns Current blockchain height
   */
  getCurrentHeight: async (chainId: number = 1): Promise<number> => {
    const response = await explorerApi.getBlocks(chainId, 1, "desc");

    if (!response.data || response.data.length === 0) {
      throw new Error("No blocks found for chain");
    }

    return response.data[0].height;
  },
};
