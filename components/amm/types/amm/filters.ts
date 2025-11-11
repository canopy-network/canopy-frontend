import { PoolType } from "./pool";

export interface PoolFilters {
  search: string;
  poolTypes: PoolType[];
  tvlMin?: number;
  tvlMax?: number;
  volume24hMin?: number;
  volume24hMax?: number;
  aprMin?: number;
  aprMax?: number;
}

export const DEFAULT_POOL_FILTERS: PoolFilters = {
  search: "",
  poolTypes: [PoolType.Virtual, PoolType.Graduated],
};
