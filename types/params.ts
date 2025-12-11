/**
 * Blockchain parameter types
 *
 * Types for blockchain configuration parameters fetched from /api/v1/params endpoints
 */

/**
 * Fee parameters from the blockchain
 *
 * All fees are in uCNPY (micro units)
 * Source: canopy/main/fsm/gov.pb.go FeeParams struct
 */
export interface FeeParams {
  sendFee: number;
  stakeFee: number;
  editStakeFee: number;
  unstakeFee: number;
  pauseFee: number;
  unpauseFee: number;
  changeParameterFee: number;
  daoTransferFee: number;
  certificateResultsFee: number;
  subsidyFee: number;
  createOrderFee: number;
  editOrderFee: number;
  deleteOrderFee: number;
  dexLimitOrderFee: number;
  dexLiquidityDepositFee: number;
  dexLiquidityWithdrawFee: number;
}

/**
 * Default fee values as fallback when API is unavailable
 * These should match the blockchain genesis parameters
 */
export const DEFAULT_FEE_PARAMS: FeeParams = {
  sendFee: 10000,
  stakeFee: 10000,
  editStakeFee: 10000,
  unstakeFee: 10000,
  pauseFee: 10000,
  unpauseFee: 10000,
  changeParameterFee: 10000,
  daoTransferFee: 10000,
  certificateResultsFee: 0,
  subsidyFee: 10000,
  createOrderFee: 10000,
  editOrderFee: 10000,
  deleteOrderFee: 10000,
  dexLimitOrderFee: 0,
  dexLiquidityDepositFee: 0,
  dexLiquidityWithdrawFee: 0,
};
