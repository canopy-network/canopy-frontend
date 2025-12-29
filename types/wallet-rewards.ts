import type { WalletEventsPagination } from "@/types/wallet-events";
import type { RewardRecord } from "@/types/wallet-events";

export interface WalletRewardsHistoryParams {
  address?: string;
  addresses?: string[];
  chain_ids?: number[];
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  cursor?: string;
}

export interface WalletRewardsHistoryEvent {
  height: number;
  chain_id: number;
  chain_name: string;
  chain_symbol: string;
  type: string;
  address: string;
  reference: string;
  amount: string;
  sold_amount: string | null;
  bought_amount: string | null;
  cnpy_amount: string | null;
  usd_amount: string | null;
  success: boolean | null;
  timestamp: string;
}

export interface WalletRewardsHistoryChainGroup {
  source_chain_id: number;
  chain_name: string;
  chain_symbol: string;
  events: WalletRewardsHistoryEvent[];
}

export interface WalletRewardsHistoryPayload {
  events_by_chain: WalletRewardsHistoryChainGroup[];
  pagination?: WalletEventsPagination;
}

export interface WalletRewardsHistoryNormalizedResponse {
  rewards: RewardRecord[];
  pagination?: WalletEventsPagination;
}
