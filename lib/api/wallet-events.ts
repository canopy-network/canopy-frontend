import { apiClient } from "./client";
import {
  WalletEventBase,
  WalletEventsHistoryParams,
  WalletEventsHistoryResponse,
  WalletEventsPagination,
} from "@/types/wallet-events";
import { normalizeWalletEvent } from "@/lib/utils/wallet-events";

function buildQueryParams(params?: WalletEventsHistoryParams) {
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

  if (params?.types?.length) {
    query.types = params.types.join(",");
  }

  if (params?.start_date) query.start_date = params.start_date;
  if (params?.end_date) query.end_date = params.end_date;
  if (params?.page) query.page = params.page;
  if (params?.limit) query.limit = params.limit;
  if (params?.sort) query.sort = params.sort;
  if (params?.cursor) query.cursor = params.cursor;

  return query;
}

function resolvePagination(
  response: any,
  params?: WalletEventsHistoryParams
): WalletEventsPagination | undefined {
  const pagination =
    response?.pagination ||
    response?.meta ||
    response?.metadata ||
    undefined;

  if (pagination) {
    return {
      page: Number(pagination.page || params?.page || 1),
      limit: Number(pagination.limit || params?.limit || 20),
      total: Number(pagination.total || 0),
      pages: pagination.pages || pagination.total_pages,
      has_more:
        pagination.has_more ??
        (pagination.pages && pagination.page
          ? pagination.page < pagination.pages
          : undefined),
      cursor: pagination.cursor || pagination.next_cursor || null,
    };
  }

  if (!response || !Array.isArray(response)) {
    return {
      page: params?.page || 1,
      limit: params?.limit || (response?.events?.length ?? 0) || 20,
      total: response?.events?.length ?? 0,
      pages: 1,
    };
  }

  return undefined;
}

function extractRawEvents(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export const walletEventsApi = {
  /**
   * Get wallet events history
   * GET /api/v1/wallet/events/history
   */
  async getHistory(
    params?: WalletEventsHistoryParams
  ): Promise<WalletEventsHistoryResponse> {
    const response = await apiClient.get<any>(
      "/api/v1/wallet/events/history",
      buildQueryParams(params)
    );

    const raw = response.data ?? response;
    const rawEvents = extractRawEvents(raw);
    const events: WalletEventBase[] = rawEvents.map(normalizeWalletEvent);
    const pagination = resolvePagination(raw, params) || response.pagination;

    return {
      events,
      pagination,
    };
  },
};
