/**
 * @fileoverview Blocks Store
 *
 * This store manages block.finalized WebSocket events:
 * - Stores up to 5 most recent events per chainId
 * - No persistence (ephemeral WebSocket data)
 */

import { create } from "zustand";

// Types
export interface BlockFinalizedPayload {
  chainId: number;
  height: number;
}

export interface BlockFinalizedEvent {
  type: "block.finalized";
  timestamp: string;
  payload: BlockFinalizedPayload;
}

export interface BlocksState {
  // Map of chainId -> array of up to 5 most recent events
  blockEvents: Record<number, BlockFinalizedEvent[]>;
  // Counter incremented on each event (for triggering effects)
  eventCount: number;
  // Most recent event across all chains (for subscribing to all events)
  lastEvent: BlockFinalizedEvent | null;

  // Actions
  addBlockEvent: (event: BlockFinalizedEvent) => void;
  clearEvents: (chainId?: number) => void;
  getEventsForChain: (chainId: number) => BlockFinalizedEvent[];
  getLatestHeight: (chainId: number) => number | null;
  getAverageBlockTime: (chainId: number) => number | null;
  getEstimatedTimeToNextBlock: (chainId: number) => number | null;
}

const MAX_EVENTS_PER_CHAIN = 5;

export const useBlocksStore = create<BlocksState>()((set, get) => ({
  blockEvents: {},
  eventCount: 0,
  lastEvent: null,

  addBlockEvent: (event: BlockFinalizedEvent) => {
    const { chainId } = event.payload;

    set((state) => {
      const existingEvents = state.blockEvents[chainId] || [];
      const updatedEvents = [event, ...existingEvents]
        .sort((a, b) => b.payload.height - a.payload.height)
        .slice(0, MAX_EVENTS_PER_CHAIN);

      return {
        blockEvents: {
          ...state.blockEvents,
          [chainId]: updatedEvents,
        },
        eventCount: state.eventCount + 1,
        lastEvent: event,
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

  getAverageBlockTime: (chainId: number) => {
    const events = get().blockEvents[chainId];
    if (!events || events.length < 2) return null;

    const timeDiffs: number[] = [];
    for (let i = 0; i < events.length - 1; i++) {
      const newer = new Date(events[i].timestamp).getTime();
      const older = new Date(events[i + 1].timestamp).getTime();
      timeDiffs.push((newer - older) / 1000);
    }

    return timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
  },

  getEstimatedTimeToNextBlock: (chainId: number) => {
    const events = get().blockEvents[chainId];
    if (!events || events.length === 0) return null;

    const avgBlockTime = get().getAverageBlockTime(chainId);
    if (avgBlockTime === null) return null;

    const lastEventTime = new Date(events[0].timestamp).getTime();
    const now = Date.now();
    const timeSinceLastBlock = (now - lastEventTime) / 1000;

    const estimated = avgBlockTime - timeSinceLastBlock;
    return estimated > 0 ? estimated : 0;
  },
}));
