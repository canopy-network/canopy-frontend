import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { Block, GetExplorerBlocksParams } from "@/types/blocks";
import type {
  ExplorerHistoricalData,
  ExplorerOverview,
  ExplorerSearchResult,
  ExplorerTrendingChain,
  GetExplorerHistoricalParams,
  GetExplorerTransactionsParams,
  Transaction,
} from "./types";
import type { AddressResponse } from "@/types/addresses";
import {
  getExplorerAddress,
  getExplorerBlock,
  getExplorerBlocks,
  getExplorerHistorical,
  getExplorerOverview,
  getExplorerTransaction,
  getExplorerTransactions,
  getExplorerTrendingChains,
  searchExplorerEntities,
} from "./queries";

export function useExplorerTransactions(
  params?: GetExplorerTransactionsParams,
  options?: Omit<UseQueryOptions<Transaction[], Error>, "queryKey" | "queryFn">
): UseQueryResult<Transaction[], Error> {
  return useQuery({
    queryKey: ["explorer", "transactions", params],
    queryFn: () => getExplorerTransactions(params),
    staleTime: 10000,
    ...options,
  });
}

export function useExplorerTransaction(
  hash: string,
  chainId?: number,
  options?: Omit<UseQueryOptions<Transaction, Error>, "queryKey" | "queryFn">
): UseQueryResult<Transaction, Error> {
  return useQuery({
    queryKey: ["explorer", "transaction", hash, chainId],
    queryFn: () => getExplorerTransaction(hash, chainId),
    enabled: !!hash,
    staleTime: 30000,
    ...options,
  });
}

export function useExplorerBlocks(
  params?: GetExplorerBlocksParams,
  options?: Omit<UseQueryOptions<Block[], Error>, "queryKey" | "queryFn">
): UseQueryResult<Block[], Error> {
  return useQuery({
    queryKey: ["explorer", "blocks", params],
    queryFn: () => getExplorerBlocks(params),
    staleTime: 10000,
    ...options,
  });
}

export function useExplorerBlock(
  height: number,
  chainId?: number,
  options?: Omit<UseQueryOptions<Block, Error>, "queryKey" | "queryFn">
): UseQueryResult<Block, Error> {
  return useQuery({
    queryKey: ["explorer", "block", height, chainId],
    queryFn: () => getExplorerBlock(height, chainId),
    enabled: !!height,
    staleTime: 30000,
    ...options,
  });
}

export function useExplorerOverview(
  params?: { chain_id?: number },
  options?: Omit<UseQueryOptions<ExplorerOverview | null, Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerOverview | null, Error> {
  return useQuery({
    queryKey: ["explorer", "overview", params],
    queryFn: () => getExplorerOverview(params),
    staleTime: 30000,
    ...options,
  });
}

export function useExplorerTrendingChains(
  params?: { limit?: number },
  options?: Omit<UseQueryOptions<ExplorerTrendingChain[], Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerTrendingChain[], Error> {
  return useQuery({
    queryKey: ["explorer", "trending", params],
    queryFn: () => getExplorerTrendingChains(params),
    staleTime: 30000,
    ...options,
  });
}

export function useExplorerAddress(
  address: string,
  includeTransactions: boolean = true,
  transactionLimit: number = 10,
  options?: Omit<UseQueryOptions<AddressResponse | null, Error>, "queryKey" | "queryFn">
): UseQueryResult<AddressResponse | null, Error> {
  return useQuery({
    queryKey: ["explorer", "address", address, includeTransactions, transactionLimit],
    queryFn: () => getExplorerAddress(address, includeTransactions, transactionLimit),
    enabled: !!address,
    staleTime: 30000,
    ...options,
  });
}

export function useExplorerSearch(
  query: string,
  options?: Omit<UseQueryOptions<ExplorerSearchResult[], Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerSearchResult[], Error> {
  return useQuery({
    queryKey: ["explorer", "search", query],
    queryFn: () => searchExplorerEntities(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60000,
    ...options,
  });
}

export function useExplorerHistorical(
  params: GetExplorerHistoricalParams | undefined,
  options?: Omit<UseQueryOptions<ExplorerHistoricalData | null, Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerHistoricalData | null, Error> {
  return useQuery({
    queryKey: ["explorer", "historical", params],
    queryFn: () => (params ? getExplorerHistorical(params) : Promise.resolve(null)),
    enabled: !!params && !!params.range && !!params.interval,
    staleTime: 60000,
    ...options,
  });
}
