/**
 * Lock Orders Store
 * 
 * Persistent store for tracking locked orders during USDC -> CNPY conversions.
 * Orders are tracked from lock transaction through polling until they can be closed.
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type { OrderBookApiOrder } from "@/types/orderbook";

export type LockedOrderStatus = "locking" | "locked" | "closing" | "closed" | "error";

export interface LockedOrder {
  orderId: string;
  orderData: OrderBookApiOrder;
  lockTxHash: string;
  lockTimestamp: number;
  status: LockedOrderStatus;
  buyerEthAddress: string;
  buyerCanopyAddress: string;
  closeTxHash?: string;
  error?: string;
  networkFee?: number; // Fee in USDC (from transaction receipt)
}

export interface LockOrdersState {
  lockedOrders: Record<string, LockedOrder>;
  
  // Actions
  addLockedOrder: (
    orderId: string,
    orderData: OrderBookApiOrder,
    lockTxHash: string,
    buyerEthAddress: string,
    buyerCanopyAddress: string
  ) => void;
  updateOrderStatus: (orderId: string, status: LockedOrderStatus, error?: string) => void;
  updateOrderData: (orderId: string, orderData: OrderBookApiOrder) => void;
  setCloseTxHash: (orderId: string, closeTxHash: string) => void;
  setNetworkFee: (orderId: string, fee: number) => void;
  removeOrder: (orderId: string) => void;
  getPendingOrders: () => LockedOrder[];
  getLockingOrders: () => LockedOrder[];
  getLockedOrders: () => LockedOrder[];
  clearCompletedOrders: () => void;
  clearAllOrders: () => void;
}

// Custom storage for Zustand
const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useLockOrdersStore = create<LockOrdersState>()(
  persist(
    (set, get) => ({
      lockedOrders: {},

      addLockedOrder: (
        orderId: string,
        orderData: OrderBookApiOrder,
        lockTxHash: string,
        buyerEthAddress: string,
        buyerCanopyAddress: string
      ) => {
        set((state) => ({
          lockedOrders: {
            ...state.lockedOrders,
            [orderId]: {
              orderId,
              orderData,
              lockTxHash,
              lockTimestamp: Date.now(),
              status: "locking",
              buyerEthAddress,
              buyerCanopyAddress,
            },
          },
        }));
      },

      updateOrderStatus: (orderId: string, status: LockedOrderStatus, error?: string) => {
        set((state) => {
          const order = state.lockedOrders[orderId];
          if (!order) return state;

          return {
            lockedOrders: {
              ...state.lockedOrders,
              [orderId]: {
                ...order,
                status,
                error: error || order.error,
              },
            },
          };
        });
      },

      updateOrderData: (orderId: string, orderData: OrderBookApiOrder) => {
        set((state) => {
          const order = state.lockedOrders[orderId];
          if (!order) return state;

          return {
            lockedOrders: {
              ...state.lockedOrders,
              [orderId]: {
                ...order,
                orderData,
              },
            },
          };
        });
      },

      setCloseTxHash: (orderId: string, closeTxHash: string) => {
        set((state) => {
          const order = state.lockedOrders[orderId];
          if (!order) return state;

          return {
            lockedOrders: {
              ...state.lockedOrders,
              [orderId]: {
                ...order,
                closeTxHash,
              },
            },
          };
        });
      },

      setNetworkFee: (orderId: string, fee: number) => {
        set((state) => {
          const order = state.lockedOrders[orderId];
          if (!order) return state;

          return {
            lockedOrders: {
              ...state.lockedOrders,
              [orderId]: {
                ...order,
                networkFee: fee,
              },
            },
          };
        });
      },

      removeOrder: (orderId: string) => {
        set((state) => {
          const { [orderId]: removed, ...rest } = state.lockedOrders;
          return { lockedOrders: rest };
        });
      },

      getPendingOrders: () => {
        const state = get();
        return Object.values(state.lockedOrders).filter(
          (order) => order.status === "locking" || order.status === "locked" || order.status === "closing"
        );
      },

      getLockingOrders: () => {
        const state = get();
        return Object.values(state.lockedOrders).filter((order) => order.status === "locking");
      },

      getLockedOrders: () => {
        const state = get();
        return Object.values(state.lockedOrders).filter((order) => order.status === "locked");
      },

      clearCompletedOrders: () => {
        set((state) => {
          const filtered = Object.fromEntries(
            Object.entries(state.lockedOrders).filter(
              ([, order]) => order.status !== "closed" && order.status !== "error"
            )
          );
          return { lockedOrders: filtered };
        });
      },

      clearAllOrders: () => {
        set({ lockedOrders: {} });
      },
    }),
    {
      name: "canopy-lock-orders-storage",
      storage: createJSONStorage(() => zustandStorage),
      // Only persist orders that are not completed (keep tracking in-progress orders)
      partialize: (state) => ({
        lockedOrders: Object.fromEntries(
          Object.entries(state.lockedOrders).filter(
            ([, order]) => order.status !== "closed" && order.status !== "error"
          )
        ),
      }),
    }
  )
);

