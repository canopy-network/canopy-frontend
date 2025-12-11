// API response types matching /api/v1/orderbook endpoint

export interface OrderBookApiOrder {
  id: string;
  committee: number;
  data?: string;
  amountForSale: number;
  requestedAmount: number;
  sellerReceiveAddress: string;
  buyerSendAddress?: string;
  buyerReceiveAddress?: string;
  buyerChainDeadline?: number;
  sellersSendAddress: string;
}

export interface ChainOrderBook {
  chainID: number;
  orders: OrderBookApiOrder[];
}

// API returns array of ChainOrderBook directly
export type OrderBookResponse = ChainOrderBook[];

// UI display types
export interface DisplayOrder {
  id: string;
  price: number;
  amount: number;
  total: number;
}

/**
 * LockOrder data payload sent with ERC20 transfer on Ethereum
 * This JSON is hex-encoded and appended to the ERC20 transfer call data
 */
export interface LockOrderData {
  orderId: string;           // ID of the order being bought
  chain_id: number;          // Committee ID (e.g., 3 for USDC)
  buyerSendAddress: string;  // Ethereum address sending USDC (no 0x prefix)
  buyerReceiveAddress: string; // Canopy address to receive CNPY (no 0x prefix)
  buyerChainDeadline: number;  // Ethereum block height deadline
}

/**
 * Parameters for the useLockOrder hook
 */
export interface LockOrderParams {
  order: OrderBookApiOrder;
  buyerEthAddress: string;    // Ethereum address (with 0x prefix)
  buyerCanopyAddress: string; // Canopy address (with 0x prefix)
  usdcAmount: bigint;         // Amount in USDC smallest units (6 decimals)
}

/**
 * CloseOrder data payload sent with ERC20 transfer on Ethereum
 * This is the actual USDC payment to the seller
 */
export interface CloseOrderData {
  orderId: string;    // ID of the order being closed
  closeOrder: true;   // Flag to indicate this is a close order
  chain_id: number;   // Committee ID (e.g., 3 for USDC)
}

/**
 * Helper to determine if an order needs LockOrder or CloseOrder
 * - No buyerReceiveAddress = needs LockOrder (signal intent)
 * - Has buyerReceiveAddress = needs CloseOrder (send payment)
 */
export function isOrderLocked(order: OrderBookApiOrder): boolean {
  return !!order.buyerReceiveAddress;
}
