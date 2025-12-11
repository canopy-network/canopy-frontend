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
