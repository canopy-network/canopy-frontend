/**
 * WebSocket Module
 *
 * Exports for the WebSocket client and types.
 */

export { WebSocketClient, getWebSocketClient, resetWebSocketClient } from "./client";

export type {
  ConnectionState,
  WsMessage,
  WsClientOptions,
  MessageHandler,
  MessageHandlers,
  SubscribeMessage,
  UnsubscribeMessage,
  PingMessage,
  PongMessage,
  ErrorMessage,
  OrderUpdateMessage,
  PriceUpdateMessage,
  TransactionMessage,
  NotificationMessage,
  KnownMessage,
} from "./types";
