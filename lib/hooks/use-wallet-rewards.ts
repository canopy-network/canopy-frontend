"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { walletRewardsApi } from "@/lib/api/wallet-rewards";
import type { WalletRewardsHistoryParams } from "@/types/wallet-rewards";

export const walletRewardsKeys = {
  all: ["wallet-rewards"] as const,
  history: (
    addresses?: string[],
    filters?: Partial<WalletRewardsHistoryParams>
  ) => [...walletRewardsKeys.all, "history", addresses, filters] as const,
};

interface UseWalletRewardsOptions {
  enabled?: boolean;
  pageSize?: number;
}

export function useWalletRewardsHistory(
  params: WalletRewardsHistoryParams = {},
  options?: UseWalletRewardsOptions
) {
  const addresses = params.address
    ? [params.address]
    : params.addresses ?? [];

  const enabled =
    options?.enabled ?? (addresses.length > 0 || !!params.address);

  const query = useInfiniteQuery({
    queryKey: walletRewardsKeys.history(addresses, params),
    queryFn: ({ pageParam = params.page ?? 1 }) =>
      walletRewardsApi.getHistory({
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

  const rewards =
    query.data?.pages.flatMap((page) => page.rewards || []) ?? [];

  return {
    ...query,
    rewards,
    isEmpty: !query.isLoading && rewards.length === 0,
  };
}

