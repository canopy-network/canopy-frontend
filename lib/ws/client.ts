/**
 * WebSocket Client
 *
 * A robust WebSocket client with automatic reconnection, heartbeat,
 * and message handling capabilities.
 */

import { wsConfig } from "@/lib/config/ws";
import type {
  ConnectionState,
  WsMessage,
  WsClientOptions,
  MessageHandler,
  MessageHandlers,
} from "./types";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WsClientOptions>;
  private state: ConnectionState = "disconnected";
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private handlers: MessageHandlers = {};
  private subscriptions: Set<string> = new Set();

  constructor(options: WsClientOptions = {}) {
    this.options = {
      url: options.url ?? wsConfig.url,
      reconnectInterval: options.reconnectInterval ?? wsConfig.reconnectInterval,
      maxReconnectAttempts: options.maxReconnectAttempts ?? wsConfig.maxReconnectAttempts,
      debug: options.debug ?? wsConfig.debug,
      onConnect: options.onConnect ?? (() => {}),
      onDisconnect: options.onDisconnect ?? (() => {}),
      onError: options.onError ?? (() => {}),
      onReconnect: options.onReconnect ?? (() => {}),
      onMessage: options.onMessage ?? (() => {}),
    };
  }

  /** Get current connection state */
  get connectionState(): ConnectionState {
    return this.state;
  }

  /** Check if connected */
  get isConnected(): boolean {
    return this.state === "connected" && this.ws?.readyState === WebSocket.OPEN;
  }

  /** Connect to WebSocket server */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      this.log("Already connected or connecting");
      return;
    }

    this.state = "connecting";
    this.log(`Connecting to ${this.options.url}`);

    try {
      this.ws = new WebSocket(this.options.url);
      this.setupEventHandlers();
    } catch (error) {
      this.log("Failed to create WebSocket", error);
      this.handleReconnect();
    }
  }

  /** Disconnect from WebSocket server */
  disconnect(): void {
    this.log("Disconnecting");
    this.clearTimers();
    this.reconnectAttempts = 0;
    this.subscriptions.clear();

    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.state = "disconnected";
  }

  /** Send a message to the server */
  send<T>(type: string, payload: T): boolean {
    if (!this.isConnected) {
      this.log("Cannot send message: not connected");
      return false;
    }

    const message: WsMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    try {
      this.ws!.send(JSON.stringify(message));
      this.log("Sent message", message);
      return true;
    } catch (error) {
      this.log("Failed to send message", error);
      return false;
    }
  }

  /** Subscribe to a channel */
  subscribe(channel: string, params?: Record<string, unknown>): boolean {
    const success = this.send("subscribe", { channel, params });
    if (success) {
      this.subscriptions.add(channel);
    }
    return success;
  }

  /** Unsubscribe from a channel */
  unsubscribe(channel: string): boolean {
    const success = this.send("unsubscribe", { channel });
    if (success) {
      this.subscriptions.delete(channel);
    }
    return success;
  }

  /** Register a message handler for a specific message type */
  on<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      this.off(type, handler);
    };
  }

  /** Remove a message handler */
  off<T = unknown>(type: string, handler: MessageHandler<T>): void {
    if (!this.handlers[type]) return;
    this.handlers[type] = this.handlers[type].filter((h) => h !== handler);
  }

  /** Remove all handlers for a message type */
  offAll(type: string): void {
    delete this.handlers[type];
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log("Connected");
      this.state = "connected";
      this.reconnectAttempts = 0;
      this.resubscribe();
      this.options.onConnect();
    };

    this.ws.onclose = (event) => {
      this.log("Disconnected", { code: event.code, reason: event.reason });
      this.state = "disconnected";
      this.clearTimers();
      this.options.onDisconnect(event);

      // Attempt reconnection if not a clean close
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      this.log("Error", event);
      this.options.onError(event);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WsMessage;
        this.handleMessage(message);
      } catch (error) {
        this.log("Failed to parse message", error);
      }
    };
  }

  private handleMessage(message: WsMessage): void {
    this.log("Received message", message);

    // Call global message handler
    this.options.onMessage(message);

    // Call type-specific handlers
    const handlers = this.handlers[message.type];
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Call wildcard handlers
    const wildcardHandlers = this.handlers["*"];
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  private handleReconnect(): void {
    if (this.options.maxReconnectAttempts > 0 && this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log("Max reconnection attempts reached");
      return;
    }

    this.state = "reconnecting";
    this.reconnectAttempts++;
    this.log(`Reconnecting (attempt ${this.reconnectAttempts})`);
    this.options.onReconnect(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  private resubscribe(): void {
    // Re-subscribe to all channels after reconnection
    this.subscriptions.forEach((channel) => {
      this.send("subscribe", { channel });
    });
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private log(message: string, data?: unknown): void {
    if (this.options.debug) {
      console.log(`[WS] ${message}`, data ?? "");
    }
  }
}

/** Singleton instance for global usage */
let globalClient: WebSocketClient | null = null;

/** Get or create the global WebSocket client */
export function getWebSocketClient(options?: WsClientOptions): WebSocketClient {
  if (!globalClient) {
    globalClient = new WebSocketClient(options);
  }
  return globalClient;
}

/** Reset the global WebSocket client */
export function resetWebSocketClient(): void {
  if (globalClient) {
    globalClient.disconnect();
    globalClient = null;
  }
}
