import { apiClient } from "./client";
import type { OrderBookResponse } from "@/types/orderbook";

export interface GetOrderBookParams {
  chainId?: number;
  height?: number;
}

export const orderbookApi = {
  getOrderBook: (params?: GetOrderBookParams) =>
    apiClient.get<OrderBookResponse>("/api/v1/orderbook", params),
};
