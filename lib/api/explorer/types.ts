import type { ExplorerBlockSearchResult } from "@/types/blocks";
import type { AddressResponse } from "@/types/addresses";

export type { AddressResponse };

export interface Transaction {
  chain_id: number;
  height: number;
  tx_hash: string;
  timestamp: string;
  message_type: string;
  signer: string;
  fee: number;
  counterparty?: string | null;
  amount?: number | null;
  validator_address?: string | null;
  dest_chain_id?: number | null;
  order_id?: string | null;
  pool_id?: string | null;
  sell_asset_chain_id?: number | null;
  buy_asset_chain_id?: number | null;
  sell_amount?: number | null;
  buy_amount?: number | null;
  limit_price?: number | null;
  message_json?: string | null;
}

export interface ExplorerTransactionsResponse {
  data: Transaction[];
  pagination: {
    limit: number;
    next_cursor: number | null;
  };
}

export interface VolumeHistoryEntry {
  date: string;
  volume: number;
  volume_fmt?: string;
}

export interface ExplorerTrendingChain {
  rank: number;
  chain_id: number;
  chain_name: string;
  market_cap: number;
  tvl: number;
  volume_24h: number;
  validators: number;
  holders: number;
  risk?: string | null;
  liquidity?: number | null;
  change_24h?: number | null;
  volume_history?: VolumeHistoryEntry[];
}

export interface ExplorerTrendingChainsResponse {
  data: ExplorerTrendingChain[];
  pagination?: {
    limit?: number;
    next_cursor?: number | null;
    total?: number;
  };
}

export interface HistoricalDataPoint {
  time: number;
  value: number;
}

export interface ExplorerHistoricalData {
  tvl?: HistoricalDataPoint[];
  volume?: HistoricalDataPoint[];
  validators?: HistoricalDataPoint[];
  transactions?: HistoricalDataPoint[];
}

export interface ExplorerHistoricalResponse {
  data: ExplorerHistoricalData;
  pagination: null;
}

export interface GetExplorerHistoricalParams {
  chain_id?: number;
  range: string;
  interval: string;
}

export interface GetExplorerTransactionsParams {
  chain_id?: number;
  message_type?: string;
  signer?: string;
  counterparty?: string;
  limit?: number;
  cursor?: number;
  sort?: "asc" | "desc";
}

export interface ExplorerSearchResultBase<TType extends string = string, TResult = unknown> {
  type: TType;
  chain_id: number;
  result: TResult;
}

export interface ExplorerAddressSearchResult
  extends ExplorerSearchResultBase<
    "address",
    {
      address: string;
      total_transactions?: number;
      recent_txs?: Transaction[];
    }
  > {
  type: "address";
}

export interface ExplorerTransactionSearchResult
  extends ExplorerSearchResultBase<"transaction", Transaction> {
  type: "transaction";
}

export type ExplorerSearchResult =
  | ExplorerAddressSearchResult
  | ExplorerTransactionSearchResult
  | ExplorerBlockSearchResult
  | ExplorerSearchResultBase;

export interface ExplorerSearchResponse {
  data: ExplorerSearchResult[];
  pagination: null | {
    limit?: number;
    next_cursor?: number | null;
  };
}

export interface ExplorerOverview {
  market_cap?: number;
  market_cap_formatted?: string;
  market_cap_change_24h?: number;
  tvl: number;
  tvl_formatted: string;
  tvl_change_24h: number;
  volume_24h: number;
  volume_24h_formatted: string;
  volume_change_24h: number;
  active_chains: number;
  active_chains_change: number;
  total_validators: number;
  total_validators_change: number;
  total_holders: number;
  total_holders_change: number;
  total_transactions: number;
  total_transactions_change: number;
  tvl_history?: Array<{ time: number; value: number }>;
  volume_history?: Array<{ time: number; value: number }>;
}

export interface ExplorerOverviewResponse {
  data: ExplorerOverview;
}
