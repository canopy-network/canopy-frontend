/**
 * @fileoverview Trading component type definitions
 *
 * This module contains type definitions for trading-related components
 * including tokens, token pairs, confirmation data, and chain data.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

/**
 * Token interface matching the structure used in trading components
 */
export interface Token {
  symbol: string;
  name: string;
  brandColor?: string;
  currentPrice?: number;
  chainId?: number;
  logo?: string;
  address?: string;
  decimals?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  isNative?: boolean;
  // Additional properties for bridge tokens
  chain?: string;
  chainName?: string;
  chainColor?: string;
  balance?: number;
  walletAddress?: string;
  color?: string; // Alternative to brandColor for bridge tokens
}

/**
 * Token pair interface for default token pairs
 */
export interface TokenPair {
  tokenA: Token | null;
  tokenB: Token | null;
}

/**
 * Confirmation data for swap operations
 */
export interface ConfirmationData {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
}

/**
 * Chain data interface for chain-specific operations
 */
export interface ChainData {
  id?: string;
  ticker: string;
  name: string;
  brandColor?: string;
  currentPrice?: number;
  logo?: string;
  creator?: string;
  priceChange24h?: number;
  volume?: number;
  marketCap?: number;
}

/**
 * Trading module variant type
 */
export type TradingVariant = "trade" | "chain" | "liquidity";

/**
 * Tab type for trading module
 */
export type TabType = "swap" | "liquidity" | "convert" | "buy" | "sell";

/**
 * Token dialog mode
 */
export type TokenDialogMode = "from" | "to" | "tokenA" | "tokenB" | null;

/**
 * Input mode for amount inputs
 */
export type InputMode = "token" | "usd";

/**
 * Order book order interface
 */
export interface OrderBookOrder {
  id: string;
  maker: string;
  token: string;
  chain: string;
  amount: number;
  price: number;
  discount: number;
  expiresIn: number;
  status: string;
  savings?: number;
  cost?: number;
}

/**
 * Order selection result
 */
export interface OrderSelection {
  selectedOrders: OrderBookOrder[];
  totalSavings: number;
  totalCost: number;
  cnpyReceived: number;
  gap: number;
  isFullyFilled?: boolean;
}

/**
 * Connected wallet state
 */
export interface ConnectedWallet {
  connected: boolean;
  address: string | null;
  balances: Record<string, number>;
}

/**
 * Connected wallets map
 */
export interface ConnectedWallets {
  ethereum: ConnectedWallet;
  solana?: ConnectedWallet;
}

/**
 * Bridge token selection result
 */
export interface BridgeToken {
  symbol: string;
  name: string;
  color: string;
  chain: string;
  chainName: string;
  chainColor: string;
  balance: number;
  walletAddress: string;
}

/**
 * User LP position
 */
export interface UserLiquidityPosition {
  poolId: string;
  valueUSD: number;
  tokenAAmount: number;
  tokenBAmount: number;
  share: number;
  earnings: number;
}
