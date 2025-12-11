/**
 * Address Book API
 *
 * API module for managing saved contacts and addresses.
 * Requires authentication (session token).
 */

import { apiClient } from "./client";
import type {
  AddressBookEntry,
  AddressBookListResponse,
  CreateAddressBookEntryRequest,
  UpdateAddressBookEntryRequest,
  GetAddressBookParams,
  SearchAddressBookParams,
} from "@/types/address-book";

/**
 * Address Book API endpoints
 */
export const addressBookApi = {
  /**
   * Create a new address book entry
   * POST /api/v1/address-book
   */
  create: (data: CreateAddressBookEntryRequest) =>
    apiClient.post<AddressBookEntry>("/api/v1/address-book", data),

  /**
   * List all address book entries with optional filtering
   * GET /api/v1/address-book
   */
  list: (params?: GetAddressBookParams) => {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      page: params?.page,
      limit: params?.limit,
      chain_id: params?.chain_id,
      network: params?.network,
      contact_label: params?.contact_label,
      is_favorite: params?.is_favorite,
      is_verified: params?.is_verified,
      is_active: params?.is_active,
      q: params?.q,
    };
    return apiClient.get<AddressBookListResponse>(
      "/api/v1/address-book",
      queryParams
    );
  },

  /**
   * Get a specific address book entry by ID
   * GET /api/v1/address-book/:id
   */
  get: (id: string) =>
    apiClient.get<AddressBookEntry>(`/api/v1/address-book/${id}`),

  /**
   * Update an address book entry
   * PUT /api/v1/address-book/:id
   */
  update: (id: string, data: UpdateAddressBookEntryRequest) =>
    apiClient.put<AddressBookEntry>(`/api/v1/address-book/${id}`, data),

  /**
   * Delete an address book entry
   * DELETE /api/v1/address-book/:id
   */
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/address-book/${id}`),

  /**
   * Get all favorite address book entries
   * GET /api/v1/address-book/favorites
   */
  getFavorites: (params?: { page?: number; limit?: number }) =>
    apiClient.get<AddressBookListResponse>("/api/v1/address-book/favorites", params),

  /**
   * Search address book entries
   * GET /api/v1/address-book/search
   */
  search: (params: SearchAddressBookParams) => {
    const queryParams: Record<string, string | number | undefined> = {
      q: params.q,
      page: params.page,
      limit: params.limit,
    };
    return apiClient.get<AddressBookListResponse>(
      "/api/v1/address-book/search",
      queryParams
    );
  },

  /**
   * Toggle favorite status for an entry
   * Convenience method that fetches current state and toggles is_favorite
   */
  toggleFavorite: async (id: string) => {
    const current = await addressBookApi.get(id);
    return addressBookApi.update(id, {
      is_favorite: !current.data.is_favorite,
    });
  },

  /**
   * Mark an address as verified
   */
  markVerified: (id: string) =>
    addressBookApi.update(id, { is_verified: true }),

  /**
   * Toggle watched status for an entry
   */
  toggleWatched: async (id: string) => {
    const current = await addressBookApi.get(id);
    return addressBookApi.update(id, {
      is_watched: !current.data.is_watched,
    });
  },
};
