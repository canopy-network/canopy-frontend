/**
 * @fileoverview Blocks Store
 *
 * This store manages block.indexed WebSocket events:
 * - Stores up to 5 most recent events per chainId
 * - No persistence (ephemeral WebSocket data)
 */

import { create } from "zustand";

// Types
export interface BlockIndexedPayload {
  chainId: number;
  height: number;
}

export interface BlockIndexedEvent {
  type: "block.indexed";
  timestamp: string;
  payload: BlockIndexedPayload;
}

export interface BlocksState {
  // Map of chainId -> array of up to 5 most recent events
  blockEvents: Record<number, BlockIndexedEvent[]>;

  // Actions
  addBlockEvent: (event: BlockIndexedEvent) => void;
  clearEvents: (chainId?: number) => void;
  getEventsForChain: (chainId: number) => BlockIndexedEvent[];
  getLatestHeight: (chainId: number) => number | null;
}

const MAX_EVENTS_PER_CHAIN = 5;

export const useBlocksStore = create<BlocksState>()((set, get) => ({
  blockEvents: {},

  addBlockEvent: (event: BlockIndexedEvent) => {
    const { chainId } = event.payload;

    set((state) => {
      const existingEvents = state.blockEvents[chainId] || [];
      const updatedEvents = [event, ...existingEvents].slice(
        0,
        MAX_EVENTS_PER_CHAIN
      );

      return {
        blockEvents: {
          ...state.blockEvents,
          [chainId]: updatedEvents,
        },
      };
    });
  },

  clearEvents: (chainId?: number) => {
    if (chainId !== undefined) {
      set((state) => {
        const { [chainId]: _, ...rest } = state.blockEvents;
        return { blockEvents: rest };
      });
    } else {
      set({ blockEvents: {} });
    }
  },

  getEventsForChain: (chainId: number) => {
    return get().blockEvents[chainId] || [];
  },

  getLatestHeight: (chainId: number) => {
    const events = get().blockEvents[chainId];
    if (!events || events.length === 0) return null;
    return events[0].payload.height;
  },
}));
