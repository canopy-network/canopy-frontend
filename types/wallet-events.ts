/**
 * Wallet events and rewards types
 */

export interface WalletEventBase {
  id: string;
  timestamp: string;
  txHash?: string;
  type: string;
  amount?: string;
  token?: string;
  address?: string;
  chain_id?: number;
  direction?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  raw: unknown;
}

export interface WalletEventsHistoryParams {
  address?: string;
  addresses?: string[];
  chain_ids?: number[];
  types?: string[];
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  cursor?: string;
}

export interface WalletEventsPagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  has_more?: boolean;
  cursor?: string | null;
}

export interface WalletEventsHistoryResponse {
  events: WalletEventBase[];
  pagination?: WalletEventsPagination;
}

export type RewardSource = "autocompound" | "withdrawal" | "unknown";

export interface RewardRecord {
  timestamp: string;
  amount: number;
  token?: string;
  txHash?: string;
  source: RewardSource;
  relatedStakeKey?: string;
  rawType?: string;
  metadata?: Record<string, unknown>;
}
