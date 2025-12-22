/**
 * Address Book Types
 *
 * TypeScript interfaces for the address book API endpoints.
 * Allows users to save and manage contacts/addresses across multiple networks.
 */

/**
 * Address book entry as returned by the API
 */
export interface AddressBookEntry {
  id: string;
  user_id: string;
  address: string;
  chain_id: string | null;
  network: string | null;
  contact_name: string;
  contact_label: string | null;
  notes: string | null;
  is_verified: boolean;
  is_favorite: boolean;
  is_watched: boolean;
  transaction_count: number;
  last_transaction_at: string | null;
  linked_user_id: string | null;
  linked_chain_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a new address book entry
 */
export interface CreateAddressBookEntryRequest {
  address: string;
  chain_id?: string;
  network?: string;
  contact_name: string;
  contact_label?: string;
  notes?: string;
  is_favorite?: boolean;
  is_watched?: boolean;
  linked_user_id?: string;
}

/**
 * Request to update an address book entry
 */
export interface UpdateAddressBookEntryRequest {
  contact_name?: string;
  contact_label?: string;
  notes?: string;
  is_verified?: boolean;
  is_favorite?: boolean;
  is_watched?: boolean;
  is_active?: boolean;
  linked_user_id?: string;
}

/**
 * Query parameters for listing address book entries
 */
export interface GetAddressBookParams {
  page?: number;
  limit?: number;
  chain_id?: string;
  network?: string;
  contact_label?: string;
  is_favorite?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
  q?: string;
}

/**
 * Query parameters for searching address book entries
 */
export interface SearchAddressBookParams {
  q: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated response for address book entries
 */
export interface AddressBookListResponse {
  entries: AddressBookEntry[];
  total_count: number;
  page: number;
  limit: number;
}

/**
 * Common network values for external blockchains
 */
export type NetworkType =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "solana"
  | "bitcoin"
  | string;

/**
 * Common contact labels
 */
export type ContactLabel =
  | "personal"
  | "exchange"
  | "friend"
  | "validator"
  | "contract"
  | "business"
  | string;
