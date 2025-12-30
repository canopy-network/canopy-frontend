import { apiClient } from "../client";
import type { AddressResponse } from "@/types/addresses";
import type {
  ExplorerHistoricalResponse,
  ExplorerOverviewResponse,
  ExplorerSearchResponse,
  ExplorerTrendingChainsResponse,
  ExplorerTransactionsResponse,
  GetExplorerHistoricalParams,
  GetExplorerTransactionsParams,
  Transaction,
} from "./types";
import type {
  Block,
  ExplorerBlocksResponse,
  GetExplorerBlocksParams,
} from "@/types/blocks";

export const explorerApi = {
  getTransactions: (params?: GetExplorerTransactionsParams) =>
    apiClient.get<ExplorerTransactionsResponse>(
      "/api/v1/explorer/transactions",
      params
    ),

  getTransaction: (hash: string, params?: { chain_id?: number }) =>
    apiClient.get<Transaction>(
      `/api/v1/explorer/transactions/${hash}`,
      params
    ),

  getBlocks: (params?: GetExplorerBlocksParams) =>
    apiClient.get<ExplorerBlocksResponse>("/api/v1/explorer/blocks", params),

  getBlock: (height: number, params?: { chain_id?: number }) =>
    apiClient.get<Block>(
      `/api/v1/explorer/blocks/${height}`.replace(/\/+$/, ""),
      params
    ),

  getOverview: (params?: { chain_id?: number }) =>
    apiClient.get<ExplorerOverviewResponse>("/api/v1/explorer/overview", params),

  getTrendingChains: (params?: { limit?: number }) =>
    apiClient.get<ExplorerTrendingChainsResponse>(
      "/api/v1/explorer/trending",
      params
    ),

  getAddress: (
    address: string,
    params?: {
      include_transactions?: boolean;
      transaction_limit?: number;
    }
  ) =>
    apiClient.get<AddressResponse>(
      `/api/v1/explorer/addresses/${address}`,
      params
    ),

  getHistorical: (params: GetExplorerHistoricalParams) => {
    const { chain_id, ...restParams } = params;
    const filteredParams =
      chain_id && chain_id !== 0 ? { ...restParams, chain_id } : restParams;
    return apiClient.get<ExplorerHistoricalResponse>(
      "/api/v1/explorer/historical",
      filteredParams
    );
  },

  search: (params: { q: string; chain_id?: number; limit?: number }) =>
    apiClient.get<ExplorerSearchResponse>("/api/v1/explorer/search", params),
};
