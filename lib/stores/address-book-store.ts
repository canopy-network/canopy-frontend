/**
 * Address Book Store
 *
 * Zustand store for managing address book state.
 * Provides caching, pagination, and CRUD operations.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { addressBookApi } from "@/lib/api/address-book";
import type {
  AddressBookEntry,
  CreateAddressBookEntryRequest,
  UpdateAddressBookEntryRequest,
  GetAddressBookParams,
} from "@/types/address-book";

interface AddressBookState {
  // State
  entries: AddressBookEntry[];
  favorites: AddressBookEntry[];
  selectedEntry: AddressBookEntry | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  totalCount: number;
  currentPage: number;
  limit: number;

  // Filters
  filters: GetAddressBookParams;

  // Actions
  fetchEntries: (params?: GetAddressBookParams) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchEntry: (id: string) => Promise<AddressBookEntry | null>;
  createEntry: (data: CreateAddressBookEntryRequest) => Promise<AddressBookEntry>;
  updateEntry: (id: string, data: UpdateAddressBookEntryRequest) => Promise<AddressBookEntry>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleWatched: (id: string) => Promise<void>;
  markVerified: (id: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  setFilters: (filters: GetAddressBookParams) => void;
  setPage: (page: number) => void;
  selectEntry: (entry: AddressBookEntry | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  entries: [],
  favorites: [],
  selectedEntry: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
  filters: {},
};

export const useAddressBookStore = create<AddressBookState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchEntries: async (params?: GetAddressBookParams) => {
        try {
          set({ isLoading: true, error: null });

          const { currentPage, limit, filters } = get();
          const queryParams = {
            page: params?.page ?? currentPage,
            limit: params?.limit ?? limit,
            ...filters,
            ...params,
          };

          const response = await addressBookApi.list(queryParams);
          const data = response.data;

          set({
            entries: data.entries,
            totalCount: data.total_count,
            currentPage: data.page,
            limit: data.limit,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch address book";
          set({ error: message, isLoading: false });
        }
      },

      fetchFavorites: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await addressBookApi.getFavorites();
          const data = response.data;

          set({
            favorites: data.entries,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch favorites";
          set({ error: message, isLoading: false });
        }
      },

      fetchEntry: async (id: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await addressBookApi.get(id);
          const entry = response.data;

          set({ selectedEntry: entry, isLoading: false });
          return entry;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch entry";
          set({ error: message, isLoading: false });
          return null;
        }
      },

      createEntry: async (data: CreateAddressBookEntryRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await addressBookApi.create(data);
          const newEntry = response.data;

          // Add to local state
          set((state) => ({
            entries: [newEntry, ...state.entries],
            totalCount: state.totalCount + 1,
            isLoading: false,
          }));

          // Update favorites if needed
          if (newEntry.is_favorite) {
            set((state) => ({
              favorites: [newEntry, ...state.favorites],
            }));
          }

          return newEntry;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to create entry";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateEntry: async (id: string, data: UpdateAddressBookEntryRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await addressBookApi.update(id, data);
          const updatedEntry = response.data;

          // Update in local state
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === id ? updatedEntry : e
            ),
            selectedEntry:
              state.selectedEntry?.id === id ? updatedEntry : state.selectedEntry,
            isLoading: false,
          }));

          // Update favorites list
          set((state) => {
            if (updatedEntry.is_favorite) {
              // Add to favorites if not already there
              const exists = state.favorites.some((f) => f.id === id);
              if (!exists) {
                return { favorites: [updatedEntry, ...state.favorites] };
              }
              return {
                favorites: state.favorites.map((f) =>
                  f.id === id ? updatedEntry : f
                ),
              };
            } else {
              // Remove from favorites
              return {
                favorites: state.favorites.filter((f) => f.id !== id),
              };
            }
          });

          return updatedEntry;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to update entry";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deleteEntry: async (id: string) => {
        try {
          set({ isLoading: true, error: null });

          await addressBookApi.delete(id);

          // Remove from local state
          set((state) => ({
            entries: state.entries.filter((e) => e.id !== id),
            favorites: state.favorites.filter((f) => f.id !== id),
            totalCount: state.totalCount - 1,
            selectedEntry: state.selectedEntry?.id === id ? null : state.selectedEntry,
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to delete entry";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      toggleFavorite: async (id: string) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;

        await get().updateEntry(id, { is_favorite: !entry.is_favorite });
      },

      toggleWatched: async (id: string) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;

        await get().updateEntry(id, { is_watched: !entry.is_watched });
      },

      markVerified: async (id: string) => {
        await get().updateEntry(id, { is_verified: true });
      },

      search: async (query: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await addressBookApi.search({ q: query });
          const data = response.data;

          set({
            entries: data.entries,
            totalCount: data.total_count,
            currentPage: data.page,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Search failed";
          set({ error: message, isLoading: false });
        }
      },

      setFilters: (filters: GetAddressBookParams) => {
        set({ filters, currentPage: 1 });
        get().fetchEntries();
      },

      setPage: (page: number) => {
        set({ currentPage: page });
        get().fetchEntries({ page });
      },

      selectEntry: (entry: AddressBookEntry | null) => {
        set({ selectedEntry: entry });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "address-book-store" }
  )
);

// Selectors
export const selectAddressBookEntries = (state: AddressBookState) => state.entries;
export const selectFavorites = (state: AddressBookState) => state.favorites;
export const selectIsLoading = (state: AddressBookState) => state.isLoading;
export const selectError = (state: AddressBookState) => state.error;

/**
 * Get entries filtered by network
 */
export const selectEntriesByNetwork = (network: string) => (state: AddressBookState) =>
  state.entries.filter((e) => e.network === network);

/**
 * Get entries filtered by label
 */
export const selectEntriesByLabel = (label: string) => (state: AddressBookState) =>
  state.entries.filter((e) => e.contact_label === label);

/**
 * Find entry by address
 */
export const selectEntryByAddress = (address: string) => (state: AddressBookState) =>
  state.entries.find((e) => e.address.toLowerCase() === address.toLowerCase());
