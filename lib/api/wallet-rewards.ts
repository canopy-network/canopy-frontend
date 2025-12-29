import { apiClient } from "./client";
import type { RewardRecord, RewardSource, WalletEventsPagination } from "@/types/wallet-events";
import type {
  WalletRewardsHistoryChainGroup,
  WalletRewardsHistoryEvent,
  WalletRewardsHistoryNormalizedResponse,
  WalletRewardsHistoryParams,
  WalletRewardsHistoryPayload,
} from "@/types/wallet-rewards";
import { fromMicroUnits } from "@/lib/utils/denomination";

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = safeString(value).replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function detectSource(event: WalletRewardsHistoryEvent): RewardSource {
  const typeText = safeString(event.type).toLowerCase();
  if (typeText.includes("compound") || typeText.includes("restake") || typeText.includes("auto")) {
    return "autocompound";
  }
  if (typeText.includes("withdraw")) {
    return "withdrawal";
  }
  return "unknown";
}

function normalizeGroupEvent(
  group: WalletRewardsHistoryChainGroup,
  event: WalletRewardsHistoryEvent
): RewardRecord | null {
  const microAmount = parseNumeric(event.amount);
  const amount = microAmount !== null ? parseFloat(fromMicroUnits(String(microAmount), 6)) : 0;
  if (!Number.isFinite(amount) || amount === 0) return null;

  return {
    timestamp: event.timestamp,
    amount,
    token: group.chain_symbol,
    txHash: undefined,
    source: detectSource(event),
    relatedStakeKey: undefined,
    rawType: event.type,
    metadata: {
      // Primary identity for filtering: source chain group
      chain_id: group.source_chain_id,
      chain_name: group.chain_name,
      chain_symbol: group.chain_symbol,
      // Preserve raw event details too
      source_chain_id: group.source_chain_id,
      reward_chain_id: event.chain_id,
      reward_chain_name: event.chain_name,
      reward_chain_symbol: event.chain_symbol,
      reference: event.reference,
      height: event.height,
      address: event.address,
      cnpy_amount: event.cnpy_amount,
      usd_amount: event.usd_amount,
      success: event.success,
    },
  };
}

function buildQueryParams(params?: WalletRewardsHistoryParams) {
  const query: Record<string, any> = {};

  if (params?.addresses?.length) {
    query.addresses = params.addresses.join(",");
  }

  if (params?.address) {
    query.address = params.address;
  }

  if (params?.chain_ids?.length) {
    query.chain_ids = params.chain_ids.join(",");
  }

  if (params?.start_date) query.start_date = params.start_date;
  if (params?.end_date) query.end_date = params.end_date;
  if (params?.page) query.page = params.page;
  if (params?.limit) query.limit = params.limit;
  if (params?.sort) query.sort = params.sort;
  if (params?.cursor) query.cursor = params.cursor;

  return query;
}

function normalizePagination(
  payloadPagination: any,
  params?: WalletRewardsHistoryParams
): WalletEventsPagination | undefined {
  if (!payloadPagination) return undefined;
  const page = Number(payloadPagination.page || params?.page || 1);
  const pages = payloadPagination.pages !== undefined ? Number(payloadPagination.pages) : undefined;
  return {
    page,
    limit: Number(payloadPagination.limit || params?.limit || 20),
    total: Number(payloadPagination.total || 0),
    pages,
    has_more: pages ? page < pages : undefined,
    cursor: payloadPagination.cursor || payloadPagination.next_cursor || null,
  };
}

export const walletRewardsApi = {
  /**
   * Get wallet rewards history
   * GET /api/v1/wallet/rewards/history
   */
  async getHistory(
    params?: WalletRewardsHistoryParams
  ): Promise<WalletRewardsHistoryNormalizedResponse> {
    const response = await apiClient.get<WalletRewardsHistoryPayload>(
      "/api/v1/wallet/rewards/history",
      buildQueryParams(params)
    );

    const payload = response.data;
    const rewards: RewardRecord[] = (payload?.events_by_chain || [])
      .flatMap((group) =>
        (group.events || [])
          .map((event) => normalizeGroupEvent(group, event))
          .filter((r): r is RewardRecord => Boolean(r))
      );

    const pagination =
      normalizePagination(payload?.pagination, params) || response.pagination;

    return {
      rewards,
      pagination,
    };
  },
};
