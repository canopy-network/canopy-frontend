"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { walletEventsApi } from "@/lib/api/wallet-events";
import type {
  WalletEventsHistoryParams,
} from "@/types/wallet-events";

export const walletEventsKeys = {
  all: ["wallet-events"] as const,
  history: (
    addresses?: string[],
    filters?: Partial<WalletEventsHistoryParams>
  ) => [...walletEventsKeys.all, "history", addresses, filters] as const,
};

interface UseWalletEventsOptions {
  enabled?: boolean;
  pageSize?: number;
}

export function useWalletEventsHistory(
  params: WalletEventsHistoryParams = {},
  options?: UseWalletEventsOptions
) {
  const addresses = params.address
    ? [params.address]
    : params.addresses ?? [];

  const enabled =
    options?.enabled ?? (addresses.length > 0 || !!params.address);

  const query = useInfiniteQuery({
    queryKey: walletEventsKeys.history(addresses, params),
    queryFn: ({ pageParam = params.page ?? 1 }) =>
      walletEventsApi.getHistory({
        ...params,
        page: pageParam,
        limit: options?.pageSize ?? params.limit ?? 20,
      }),
    enabled,
    initialPageParam: params.page ?? 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) return undefined;
      const nextPage = (pagination.page || 1) + 1;

      if (pagination.pages && nextPage <= pagination.pages) {
        return nextPage;
      }

      if (pagination.has_more) {
        return nextPage;
      }

      return undefined;
    },
    staleTime: 30_000,
  });

  const events =
    query.data?.pages.flatMap((page) => page.events || []) ?? [];

  return {
    ...query,
    events,
    isEmpty: !query.isLoading && events.length === 0,
  };
}
