/**
 * useWebSocket Hook
 *
 * React hook for WebSocket connectivity with automatic lifecycle management.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  WebSocketClient,
  getWebSocketClient,
  type ConnectionState,
  type WsMessage,
  type WsClientOptions,
  type MessageHandler,
} from "@/lib/ws";

interface UseWebSocketOptions extends WsClientOptions {
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Channels to subscribe to on connect */
  channels?: string[];
}

interface UseWebSocketReturn {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether the client is connected */
  isConnected: boolean;
  /** Connect to the WebSocket server */
  connect: () => void;
  /** Disconnect from the WebSocket server */
  disconnect: () => void;
  /** Send a message */
  send: <T>(type: string, payload: T) => boolean;
  /** Subscribe to a channel */
  subscribe: (channel: string, params?: Record<string, unknown>) => boolean;
  /** Unsubscribe from a channel */
  unsubscribe: (channel: string) => boolean;
  /** Last received message */
  lastMessage: WsMessage | null;
  /** Last error */
  error: Event | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, channels = [], ...clientOptions } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [error, setError] = useState<Event | null>(null);

  const clientRef = useRef<WebSocketClient | null>(null);

  // Initialize client
  useEffect(() => {
    const client = getWebSocketClient({
      ...clientOptions,
      onConnect: () => {
        setConnectionState("connected");
        setError(null);
        clientOptions.onConnect?.();
      },
      onDisconnect: (event) => {
        setConnectionState("disconnected");
        clientOptions.onDisconnect?.(event);
      },
      onError: (err) => {
        setError(err);
        clientOptions.onError?.(err);
      },
      onReconnect: (attempt) => {
        setConnectionState("reconnecting");
        clientOptions.onReconnect?.(attempt);
      },
      onMessage: (message) => {
        setLastMessage(message);
        clientOptions.onMessage?.(message);
      },
    });

    clientRef.current = client;

    if (autoConnect) {
      client.connect();
    }

    // Subscribe to channels once connected
    const unsubscribes: (() => void)[] = [];
    if (channels.length > 0) {
      const handleConnect = () => {
        channels.forEach((channel) => {
          client.subscribe(channel);
        });
      };

      // If already connected, subscribe immediately
      if (client.isConnected) {
        handleConnect();
      }

      // Also subscribe on future connections
      unsubscribes.push(
        client.on("connected", handleConnect as MessageHandler)
      );
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      // Don't disconnect on unmount - let the global client persist
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const send = useCallback(<T,>(type: string, payload: T): boolean => {
    return clientRef.current?.send(type, payload) ?? false;
  }, []);

  const subscribe = useCallback((channel: string, params?: Record<string, unknown>): boolean => {
    return clientRef.current?.subscribe(channel, params) ?? false;
  }, []);

  const unsubscribe = useCallback((channel: string): boolean => {
    return clientRef.current?.unsubscribe(channel) ?? false;
  }, []);

  return {
    connectionState,
    isConnected: connectionState === "connected",
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    lastMessage,
    error,
  };
}

/**
 * useWebSocketMessage Hook
 *
 * Subscribe to specific message types from the WebSocket.
 */
export function useWebSocketMessage<T = unknown>(
  type: string,
  handler: (payload: T) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const client = getWebSocketClient();
    const unsubscribe = client.on<T>(type, (message) => {
      handler(message.payload);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}

/**
 * useWebSocketChannel Hook
 *
 * Subscribe to a channel and receive messages.
 */
export function useWebSocketChannel<T = unknown>(
  channel: string,
  handler: (payload: T) => void,
  options: { params?: Record<string, unknown>; enabled?: boolean } = {}
): void {
  const { params, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const client = getWebSocketClient();

    // Subscribe to channel
    if (client.isConnected) {
      client.subscribe(channel, params);
    }

    // Handle messages for this channel
    const unsubscribe = client.on<T>(channel, (message) => {
      handler(message.payload);
    });

    return () => {
      unsubscribe();
      if (client.isConnected) {
        client.unsubscribe(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, enabled]);
}
