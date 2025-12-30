import { explorerApi } from "./client";
import {
  unwrapExplorerList,
  unwrapExplorerPagination,
  unwrapExplorerPayload,
} from "./normalize";
import type {
  ExplorerHistoricalData,
  ExplorerOverview,
  ExplorerSearchResult,
  ExplorerTrendingChain,
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
import type { AddressResponse } from "@/types/addresses";

export async function getExplorerTransactions(
  params?: GetExplorerTransactionsParams
): Promise<Transaction[]> {
  const response = await getExplorerTransactionsWithPagination(params);
  return response.data;
}

export async function getExplorerTransactionsWithPagination(
  params?: GetExplorerTransactionsParams
): Promise<ExplorerTransactionsResponse> {
  const response = await explorerApi.getTransactions(params);
  const data = unwrapExplorerList<Transaction>(response);
  const pagination = unwrapExplorerPagination(response) ?? {
    limit: params?.limit || 20,
    next_cursor: null,
  };

  return { data, pagination };
}

export async function getExplorerTransaction(
  hash: string,
  chainId?: number
): Promise<Transaction> {
  const response = await explorerApi.getTransaction(hash, {
    chain_id: chainId,
  });
  return (unwrapExplorerPayload<Transaction>(response) || response.data) as Transaction;
}

export async function getExplorerBlocks(
  params?: GetExplorerBlocksParams
): Promise<Block[]> {
  const response = await getExplorerBlocksWithPagination(params);
  return response.data;
}

export async function getExplorerBlocksWithPagination(
  params?: GetExplorerBlocksParams
): Promise<ExplorerBlocksResponse> {
  const response = await explorerApi.getBlocks(params);
  const data = unwrapExplorerList<Block>(response);
  const pagination = unwrapExplorerPagination(response) ?? {
    limit: params?.limit || 20,
    next_cursor: null,
  };

  return { data, pagination };
}

export async function getExplorerBlock(
  height: number,
  chainId?: number
): Promise<Block> {
  const response = await explorerApi.getBlock(height, {
    chain_id: chainId,
  });
  return (unwrapExplorerPayload<Block>(response) || response.data) as Block;
}

export async function getExplorerTrendingChains(
  params?: { limit?: number }
): Promise<ExplorerTrendingChain[]> {
  try {
    const response = await explorerApi.getTrendingChains(params);
    return unwrapExplorerList<ExplorerTrendingChain>(response);
  } catch (error) {
    console.error("[getExplorerTrendingChains] Error fetching trending:", error);
    return [];
  }
}

export async function getExplorerHistorical(
  params: GetExplorerHistoricalParams
): Promise<ExplorerHistoricalData | null> {
  try {
    const response = await explorerApi.getHistorical(params);
    return unwrapExplorerPayload<ExplorerHistoricalData>(response);
  } catch (error) {
    console.error("[getExplorerHistorical] Error fetching historical data:", error);
    return null;
  }
}

export async function searchExplorerEntities(
  query: string
): Promise<ExplorerSearchResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  try {
    const response = await explorerApi.search({ q: trimmedQuery });
    return unwrapExplorerList<ExplorerSearchResult>(response);
  } catch (error) {
    console.error("[searchExplorerEntities] Error fetching search results", error);
    return [];
  }
}

export async function getExplorerOverview(
  params?: { chain_id?: number }
): Promise<ExplorerOverview | null> {
  try {
    const response = await explorerApi.getOverview(params);
    return unwrapExplorerPayload<ExplorerOverview>(response);
  } catch (error) {
    console.error("[getExplorerOverview] Error fetching overview:", error);
    return null;
  }
}

export async function getExplorerAddress(
  address: string,
  includeTransactions: boolean = true,
  transactionLimit: number = 10
): Promise<AddressResponse | null> {
  try {
    const response = await explorerApi.getAddress(address, {
      include_transactions: includeTransactions,
      transaction_limit: transactionLimit,
    });
    return unwrapExplorerPayload<AddressResponse>(response);
  } catch (error) {
    console.error("[getExplorerAddress] Error fetching address:", error);
    return null;
  }
}
