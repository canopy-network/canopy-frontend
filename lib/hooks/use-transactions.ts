/**
 * useTransactions Hook
 *
 * Custom hook for managing wallet transactions with React Query.
 * Provides transaction history, pending transactions, and transaction sending.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2025-11-28
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api";
import type {
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  PendingTransactionsRequest,
  SendRawTransactionRequest,
  SendRawTransactionResponse,
  EstimateFeeRequest,
  TransactionDetail,
  TransactionStatusResponse,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Query key factory for transaction queries
 */
export const transactionKeys = {
  all: ["transactions"] as const,
  history: (addresses: string[], filters?: Partial<TransactionHistoryRequest>) =>
    [...transactionKeys.all, "history", addresses, filters] as const,
  pending: (addresses: string[]) => [...transactionKeys.all, "pending", addresses] as const,
  detail: (hash: string, chainId: number) => [...transactionKeys.all, "detail", hash, chainId] as const,
  status: (hash: string, chainId: number) => [...transactionKeys.all, "status", hash, chainId] as const,
};

/**
 * Hook to get transaction history with pagination
 *
 * @param addresses - Array of wallet addresses
 * @param filters - Optional filters for transaction history
 * @param options - React Query options
 * @returns Transaction history query result
 */
export function useTransactionHistory(
  addresses: string[],
  filters?: {
    chain_ids?: number[];
    transaction_types?: string[];
    start_date?: string;
    end_date?: string;
  },
  options?: {
    enabled?: boolean;
    limit?: number;
  }
) {
  return useInfiniteQuery({
    queryKey: transactionKeys.history(addresses, filters),
    queryFn: async ({ pageParam = 1 }) => {
      const request: TransactionHistoryRequest = {
        addresses,
        chain_ids: filters?.chain_ids,
        transaction_types: filters?.transaction_types,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
        page: pageParam,
        limit: options?.limit ?? 20,
        sort: "desc",
      };
      return transactionsApi.getHistory(request);
    },
    enabled: options?.enabled !== false && addresses.length > 0,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get pending transactions
 *
 * @param addresses - Array of wallet addresses
 * @param chainIds - Optional chain IDs filter
 * @param options - React Query options
 * @returns Pending transactions query result
 */
export function usePendingTransactions(
  addresses: string[],
  chainIds?: number[],
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: transactionKeys.pending(addresses),
    queryFn: async () => {
      const request: PendingTransactionsRequest = {
        addresses,
        chain_ids: chainIds,
      };
      return transactionsApi.getPending(request);
    },
    enabled: options?.enabled !== false && addresses.length > 0,
    refetchInterval: options?.refetchInterval ?? 5000, // Check every 5 seconds
    staleTime: 3000,
  });
}

/**
 * Hook to get transaction details
 *
 * @param hash - Transaction hash
 * @param chainId - Chain ID
 * @param options - React Query options
 * @returns Transaction detail query result
 */
export function useTransactionDetail(
  hash: string,
  chainId: number = 1,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: transactionKeys.detail(hash, chainId),
    queryFn: () => transactionsApi.getDetails(hash, chainId),
    enabled: options?.enabled !== false && !!hash,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get transaction status with polling
 *
 * @param hash - Transaction hash
 * @param chainId - Chain ID
 * @param options - Options including polling config
 * @returns Transaction status query result
 */
export function useTransactionStatus(
  hash: string,
  chainId: number = 1,
  options?: {
    enabled?: boolean;
    pollInterval?: number;
    stopPollingOnComplete?: boolean;
  }
) {
  const query = useQuery({
    queryKey: transactionKeys.status(hash, chainId),
    queryFn: () => transactionsApi.getStatus(hash, chainId),
    enabled: options?.enabled !== false && !!hash,
    refetchInterval: (data) => {
      // Stop polling if transaction is complete and option is set
      if (options?.stopPollingOnComplete && data?.status !== "pending") {
        return false;
      }
      return options?.pollInterval ?? 5000; // Poll every 5 seconds by default
    },
    staleTime: 3000,
  });

  return {
    ...query,
    isPending: query.data?.status === "pending",
    isCompleted: query.data?.status === "completed",
    isFailed: query.data?.status === "failed",
  };
}

/**
 * Hook to send a raw transaction
 *
 * @returns Mutation for sending transactions
 */
export function useSendTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendRawTransactionRequest) => transactionsApi.sendRawTransaction(data),
    onSuccess: (response: SendRawTransactionResponse) => {
      // Invalidate transaction queries to refresh the list
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });

      // Show success toast
      toast.success("Transaction submitted successfully", {
        description: `Hash: ${response.transaction_hash.slice(0, 10)}...`,
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error("Failed to send transaction", {
        description: error.message || "Please try again",
      });
    },
  });
}

/**
 * Hook to estimate transaction fee
 *
 * @returns Mutation for estimating fees
 */
export function useEstimateFee() {
  return useMutation({
    mutationFn: (data: EstimateFeeRequest) => transactionsApi.estimateFee(data),
  });
}

/**
 * Combined transactions hook
 *
 * @param addresses - Array of wallet addresses
 * @param options - Configuration options
 * @returns Combined transaction data and actions
 */
export function useTransactions(
  addresses: string[],
  options?: {
    enabled?: boolean;
    chainIds?: number[];
    transactionTypes?: string[];
    startDate?: string;
    endDate?: string;
    historyLimit?: number;
  }
) {
  const enabled = options?.enabled !== false && addresses.length > 0;

  const history = useTransactionHistory(
    addresses,
    {
      chain_ids: options?.chainIds,
      transaction_types: options?.transactionTypes,
      start_date: options?.startDate,
      end_date: options?.endDate,
    },
    {
      enabled,
      limit: options?.historyLimit,
    }
  );

  const pending = usePendingTransactions(addresses, options?.chainIds, {
    enabled,
  });

  const sendTransaction = useSendTransaction();
  const estimateFee = useEstimateFee();

  // Flatten all pages of history
  const allTransactions = history.data?.pages.flatMap((page) => page.transactions) ?? [];

  return {
    // History data
    transactions: allTransactions,
    hasNextPage: history.hasNextPage,
    fetchNextPage: history.fetchNextPage,
    isFetchingNextPage: history.isFetchingNextPage,
    isLoadingHistory: history.isLoading,
    historyError: history.error,

    // Pending data
    pendingTransactions: pending.data?.transactions ?? [],
    isLoadingPending: pending.isLoading,
    pendingError: pending.error,

    // Mutations
    sendTransaction: sendTransaction.mutate,
    sendTransactionAsync: sendTransaction.mutateAsync,
    isSending: sendTransaction.isPending,
    sendError: sendTransaction.error,

    estimateFee: estimateFee.mutate,
    estimateFeeAsync: estimateFee.mutateAsync,
    isEstimating: estimateFee.isPending,
    estimatedFee: estimateFee.data,

    // Combined states
    isLoading: history.isLoading || pending.isLoading,
    isError: history.isError || pending.isError,
    error: history.error || pending.error,

    // Refetch functions
    refetchHistory: history.refetch,
    refetchPending: pending.refetch,
    refetchAll: async () => {
      await Promise.all([history.refetch(), pending.refetch()]);
    },
  };
}

/**
 * Helper hook to get recent transactions (last 10)
 *
 * @param addresses - Array of wallet addresses
 * @returns Recent transactions
 */
export function useRecentTransactions(addresses: string[]) {
  const { transactions, isLoadingHistory } = useTransactions(addresses, {
    historyLimit: 10,
  });

  return {
    recentTransactions: transactions.slice(0, 10),
    isLoading: isLoadingHistory,
  };
}

/**
 * Helper hook to check if any transaction is pending
 *
 * @param addresses - Array of wallet addresses
 * @returns Whether any transaction is pending
 */
export function useHasPendingTransactions(addresses: string[]) {
  const { pendingTransactions, isLoadingPending } = useTransactions(addresses);

  return {
    hasPending: pendingTransactions.length > 0,
    pendingCount: pendingTransactions.length,
    isLoading: isLoadingPending,
  };
}
