export { explorerApi } from "./client";

export {
  getExplorerAddress,
  getExplorerBlock,
  getExplorerBlocks,
  getExplorerBlocksWithPagination,
  getExplorerHistorical,
  getExplorerOverview,
  getExplorerTransaction,
  getExplorerTransactions,
  getExplorerTransactionsWithPagination,
  getExplorerTrendingChains,
  searchExplorerEntities,
} from "./queries";

export {
  useExplorerAddress,
  useExplorerBlock,
  useExplorerBlocks,
  useExplorerHistorical,
  useExplorerOverview,
  useExplorerSearch,
  useExplorerTransaction,
  useExplorerTransactions,
  useExplorerTrendingChains,
} from "./hooks";

export type {
  ExplorerHistoricalData,
  ExplorerOverview,
  ExplorerSearchResult,
  ExplorerTrendingChain,
  ExplorerTransactionsResponse,
  GetExplorerHistoricalParams,
  GetExplorerTransactionsParams,
  Transaction,
  VolumeHistoryEntry,
} from "./types";
export type { AddressResponse } from "@/types/addresses";
export type {
  Block,
  ExplorerBlocksResponse,
  GetExplorerBlocksParams,
} from "@/types/blocks";
