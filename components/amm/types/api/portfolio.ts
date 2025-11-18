export interface PortfolioOverviewRequest {
  addresses: string[];
  include_watch_only: boolean;
  height: number;
}

export interface PortfolioOverviewResponse {
  total_value_cnpy: string;
  total_value_usd?: string;
  accounts: PortfolioAccount[];
  allocation: PortfolioAllocation;
  performance: PortfolioPerformance;
  last_updated: string;
}

export interface PortfolioAccount {
  address: string;
  label?: string;
  chain_id: number;
  chain_name: string;
  balance: string;
  balance_usd?: string;
  staked_balance: string;
  staked_usd?: string;
  delegated_balance: string;
  delegated_usd?: string;
  available_balance: string;
  available_usd?: string;
}

export interface PortfolioAllocation {
  by_chain: ChainAllocation[];
  by_type: TypeAllocation;
}

export interface ChainAllocation {
  chain_id: number;
  chain_name: string;
  total_value_cnpy: string;
  total_value_usd?: string;
  percentage: number;
}

export interface TypeAllocation {
  liquid: AssetTypeDetail;
  staked: AssetTypeDetail;
  delegated: AssetTypeDetail;
}

export interface AssetTypeDetail {
  value_cnpy: string;
  value_usd?: string;
  percentage: number;
}

export interface PortfolioPerformance {
  total_pnl_usd?: string;
  total_pnl_percentage: number;
  period: string;
}
