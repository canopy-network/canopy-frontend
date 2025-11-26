import { apiClient } from "./client";
import type { VirtualPool } from "@/components/amm/types/api/pool";

export interface GetVirtualPoolsParams {
  page?: number;
  limit?: number;
  days?: number;
}

export const virtualPoolsApi = {
  getVirtualPools: (params?: GetVirtualPoolsParams) =>
    apiClient.get<VirtualPool[]>("/api/v1/virtual-pools", params),

  getVirtualPool: (chainId: string) =>
    apiClient.get<VirtualPool>(`/api/v1/virtual-pools/${chainId}`),
};
