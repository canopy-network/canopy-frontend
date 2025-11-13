// DepositLiquidityRequest represents a request to deposit liquidity into a DEX pool
export interface DepositLiquidityRequest {
  wallet_id: string; // UUID as string
  amount: string;
  committee_id: number; // uint64
  password: string;
  fee?: number; // uint64, optional
  memo?: string; // optional
}

// DepositLiquidityResponse represents the response after depositing liquidity
export interface DepositLiquidityResponse {
  transaction_hash: string;
  status: string;
  amount: string;
  committee_id: number; // uint64
  fee: string;
  submitted_at: string; // ISO 8601 date string
  order_id?: string; // optional
}
