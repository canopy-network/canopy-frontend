/**
 * WebSocket Configuration
 *
 * Configuration for the WebSocket client connection.
 */

export const wsConfig = {
  /** WebSocket server URL */
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws/blocks",

  /** Time in ms to wait before attempting reconnection */
  reconnectInterval: 3000,

  /** Maximum number of reconnection attempts (0 = unlimited) */
  maxReconnectAttempts: 5,

  /** Enable debug logging */
  debug: process.env.NODE_ENV === "development",
};

export type WsConfig = typeof wsConfig;
