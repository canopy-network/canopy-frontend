/**
 * WebSocket Types
 *
 * Type definitions for WebSocket messages and events.
 */

/** Connection states */
export type ConnectionState = "connecting" | "connected" | "disconnected" | "reconnecting";

/** Base message structure */
export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: number;
}

/** Subscription request */
export interface SubscribeMessage {
  type: "subscribe";
  payload: {
    channel: string;
    params?: Record<string, unknown>;
  };
}

/** Unsubscribe request */
export interface UnsubscribeMessage {
  type: "unsubscribe";
  payload: {
    channel: string;
  };
}

/** Heartbeat/ping message */
export interface PingMessage {
  type: "ping";
  payload: {
    timestamp: number;
  };
}

/** Heartbeat/pong response */
export interface PongMessage {
  type: "pong";
  payload: {
    timestamp: number;
  };
}

/** Error message from server */
export interface ErrorMessage {
  type: "error";
  payload: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Order update event */
export interface OrderUpdateMessage {
  type: "order_update";
  payload: {
    orderId: string;
    status: string;
    updatedAt: number;
    data?: Record<string, unknown>;
  };
}

/** Price update event */
export interface PriceUpdateMessage {
  type: "price_update";
  payload: {
    symbol: string;
    price: number;
    change24h?: number;
    volume24h?: number;
    timestamp: number;
  };
}

/** Transaction confirmation event */
export interface TransactionMessage {
  type: "transaction";
  payload: {
    txHash: string;
    status: "pending" | "confirmed" | "failed";
    blockHeight?: number;
    timestamp: number;
  };
}

/** Notification event */
export interface NotificationMessage {
  type: "notification";
  payload: {
    id: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "error" | "success";
    timestamp: number;
  };
}

/** Block finalized event */
export interface BlockFinalizedMessage {
  type: "block.finalized";
  payload: {
    chainId: number;
    height: number;
  };
}

/** Union type of all known message types */
export type KnownMessage =
  | SubscribeMessage
  | UnsubscribeMessage
  | PingMessage
  | PongMessage
  | ErrorMessage
  | OrderUpdateMessage
  | PriceUpdateMessage
  | TransactionMessage
  | NotificationMessage
  | BlockFinalizedMessage;

/** Event handler type */
export type MessageHandler<T = unknown> = (message: WsMessage<T>) => void;

/** Event handlers map */
export type MessageHandlers = {
  [key: string]: MessageHandler[];
};

/** WebSocket client options */
export interface WsClientOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
  onConnect?: () => void;
  onDisconnect?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onReconnect?: (attempt: number) => void;
  onMessage?: (message: WsMessage) => void;
}
