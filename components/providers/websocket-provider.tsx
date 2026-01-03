"use client";

/**
 * WebSocket Provider
 *
 * Provides global WebSocket connectivity for the application.
 * Automatically connects when user is authenticated.
 */

import { useEffect, useCallback } from "react";
import { useWebSocket, useWebSocketMessage } from "@/lib/hooks/use-websocket";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useBlocksStore, BlockFinalizedEvent } from "@/lib/stores/blocks-store";

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const { connect, disconnect, isConnected, connectionState } = useWebSocket({
    autoConnect: false, // We'll manage connection based on auth state
  });
  const addBlockEvent = useBlocksStore((state) => state.addBlockEvent);
  // Handle block.finalized WebSocket events
  const handleBlockFinalized = useCallback(
    (payload: { chainId: number; height: number }) => {
      const event: BlockFinalizedEvent = {
        type: "block.finalized",
        timestamp: new Date().toISOString(),
        payload,
      };
      addBlockEvent(event);
    },
    [addBlockEvent]
  );

  useWebSocketMessage<{ chainId: number; height: number }>(
    "block.finalized",
    handleBlockFinalized,
    [handleBlockFinalized]
  );

  // Connect/disconnect based on authentication state
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      console.log("[WS] User authenticated, connecting...");
      connect();
    } else if (!isAuthenticated && isConnected) {
      console.log("[WS] User logged out, disconnecting...");
      disconnect();
    }
  }, [isAuthenticated, isConnected, connect, disconnect]);

  // Log connection state changes
  useEffect(() => {
    if (connectionState !== "disconnected") {
      console.log(`[WS] Connection state: ${connectionState}`);
    }
  }, [connectionState]);

  return <>{children}</>;
}
