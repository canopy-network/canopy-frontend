# Explorer Migration and API Integration Summary

## Overview
This document summarizes the migration of the explorer functionality from `components/explorer` to `app/explorer` using Next.js API routes and React Query hooks, along with the removal of all mockup data and integration with real backend endpoints.

## Date
December 2024

## Key Changes

### 1. Migration to Next.js App Router Structure

**From:** `components/explorer/`  
**To:** `app/explorer/`

The explorer functionality was moved from the components directory to the Next.js app router structure to properly leverage server-side rendering and API routes.

### 2. API Routes Creation

Created Next.js API routes in `app/api/explorer/` and `app/api/validators/` to proxy requests to the backend API:

#### Explorer Routes:
- `app/api/explorer/blocks/route.ts` - GET list of blocks
- `app/api/explorer/blocks/[height]/route.ts` - GET specific block by height
- `app/api/explorer/transactions/route.ts` - GET list of transactions
- `app/api/explorer/transactions/[hash]/route.ts` - GET specific transaction by hash
- `app/api/explorer/overview/route.ts` - GET network overview
- `app/api/explorer/trending/route.ts` - GET trending chains
- `app/api/explorer/addresses/[address]/route.ts` - GET address information
- `app/api/explorer/search/route.ts` - GET search results

#### Validator Routes:
- `app/api/validators/route.ts` - GET list of validators
- `app/api/validators/[address]/route.ts` - GET specific validator by address
- `app/api/validators/[address]/export/route.ts` - GET validator export (JSON/CSV)

**Key Implementation Details:**
- All routes handle both Promise and direct params (Next.js 15 compatibility)
- Routes forward requests to `${API_BASE_URL}/api/v1/explorer/*` or `${API_BASE_URL}/api/v1/validators/*`
- Proper error handling with appropriate HTTP status codes
- CSV export handling with proper Content-Type and Content-Disposition headers

### 3. React Query Hooks Integration

Converted all API calls to React Query hooks in:
- `lib/api/explorer.ts` - Explorer API hooks
- `lib/api/validators.ts` - Validator API hooks

**Hooks Created:**
- `useExplorerTransactions` - Fetch paginated transactions
- `useExplorerTransaction` - Fetch single transaction
- `useExplorerBlocks` - Fetch paginated blocks
- `useExplorerBlock` - Fetch single block
- `useExplorerOverview` - Fetch network overview
- `useExplorerTrendingChains` - Fetch trending chains
- `useExplorerAddress` - Fetch address information
- `useExplorerSearch` - Search explorer entities
- `useValidators` - Fetch paginated validators
- `useValidator` - Fetch single validator
- `useValidatorExport` - Export validator data

**Benefits:**
- Automatic caching and refetching
- Loading and error states
- Stale time configuration (30 seconds default)
- Query key management for cache invalidation

### 4. API Client Configuration Updates

**File:** `lib/config/api.ts`

Updated `baseURL` configuration:
- **Client-side:** `/api` (relative path to Next.js API routes)
- **Server-side:** `http://localhost:3000/api` (or Vercel URL with `/api`)

This ensures all requests go through Next.js API routes for proper proxying.

### 5. Next.js Configuration Updates

**File:** `next.config.mjs`

**Critical Change:** Updated `rewrites` to exclude `/api/explorer/*` and `/api/validators/*` from direct backend proxying:

```javascript
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || 'http://app.neochiba.net:3001';
  return [
    // Don't rewrite /api/explorer/* or /api/validators/* - these use Next.js API routes
    // Only rewrite other /api/* paths to backend
    {
      source: '/api/:path((?!explorer|validators).*)',
      destination: `${apiUrl}/:path*`,
    },
  ]
}
```

This prevents the rewrite from intercepting Next.js API routes.

### 6. URL Trailing Slash Handling

**Files:** `lib/api/client.ts`, `lib/api/explorer.ts`

Added request interceptor in `ApiClient` to remove trailing slashes from URLs:

```typescript
this.axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Remove trailing slash from URL to avoid routing issues with Next.js
    if (config.url) {
      config.url = config.url.replace(/\/+$/, "");
    }
    // ... rest of interceptor
  }
);
```

This fixes 404 errors caused by Next.js dynamic routes not matching URLs with trailing slashes.

### 7. Removal of Mockup Data

**Files:** 
- `components/explorer/explorer-dashboard.tsx`
- `components/explorer/block-details.tsx`

**Removed:**
- All `generateSampleTransactions` and related mockup functions
- Random data generation functions (`randomBetween`, `randomFloat`, `randomChainName`, etc.)
- Hardcoded sample data
- Placeholder parent hash generation
- Mock transaction tables

**Replaced with:**
- Real data from API endpoints
- Proper loading states
- Empty state messages when no data is available
- Error handling for failed API calls

### 8. Block Details Component Enhancement

**File:** `components/explorer/block-details.tsx`

**Updates:**
- Converted to use `useExplorerBlock` React Query hook
- Extended `ExtendedApiBlock` type to include all API response fields:
  - All transaction type counts (`num_txs_send`, `num_txs_stake`, etc.)
  - All event type counts (`num_events_reward`, `num_events_slash`, etc.)
  - Total rewards and reward events
- Added display of:
  - Chain ID
  - Total Events
  - Total Rewards (properly converted from smallest unit)
  - Reward Events count
  - Transaction Types Breakdown (only shows types with count > 0)
  - Event Types Breakdown (only shows types with count > 0)

**Data Displayed:**
- Timestamp (formatted)
- Proposer address
- Transaction count
- Fee recipient
- Total fees
- Total rewards
- Hash
- Complete breakdown of transaction and event types

### 9. Explorer Dashboard Updates

**File:** `components/explorer/explorer-dashboard.tsx`

**Changes:**
- Replaced direct API calls with React Query hooks
- Removed all mockup data generation
- Added conditional rendering for loading and empty states
- Ensured all components always render (NetworkOverview, TrendingChains, RecentBlocks, RecentTransactions)

### 10. Type Definitions

**Files:** `types/blocks.ts`, `lib/api/explorer.ts`

Extended type definitions to match actual API responses, including all transaction and event type counts.

## API Endpoints Used

### Explorer Endpoints
- `GET /api/v1/explorer/blocks` - List blocks
- `GET /api/v1/explorer/blocks/{height}` - Block details
- `GET /api/v1/explorer/transactions` - List transactions
- `GET /api/v1/explorer/transactions/{hash}` - Transaction details
- `GET /api/v1/explorer/overview` - Network overview
- `GET /api/v1/explorer/trending` - Trending chains
- `GET /api/v1/explorer/addresses/{address}` - Address information
- `GET /api/v1/explorer/search` - Search entities

### Validator Endpoints
- `GET /api/v1/validators` - List validators
- `GET /api/v1/validators/{address}` - Validator details
- `GET /api/v1/validators/{address}/export` - Export validator data

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API base URL (e.g., `https://api.dev.app.canopynetwork.org`)
- `NEXTAUTH_URL_INTERNAL` - Internal Next.js URL (e.g., `http://localhost:3000`)

## Testing Checklist

- [x] Explorer dashboard loads with real data
- [x] Block details page shows all available data
- [x] No 404 errors on API routes
- [x] No trailing slash issues
- [x] React Query hooks work correctly
- [x] Loading states display properly
- [x] Error states handle failures gracefully
- [x] All mockup data removed
- [x] Transaction and event type breakdowns display correctly

## Known Issues Resolved

1. **404 Errors on Block Details:** Fixed by handling trailing slashes and updating Next.js rewrites
2. **Double `/api/api/` in URLs:** Fixed by adjusting baseURL configuration
3. **Server-side 404 errors:** Fixed by ensuring server-side requests use full Next.js URL
4. **Missing data in block details:** Fixed by extending types and displaying all available fields

## Future Improvements

1. Add pagination controls for transaction lists
2. Implement filtering and sorting for blocks/transactions
3. Add real-time updates using React Query's refetch interval
4. Add transaction details view similar to block details
5. Implement address details page with full transaction history
6. Add export functionality for block data

## Files Modified

### Created:
- `app/api/explorer/blocks/route.ts`
- `app/api/explorer/blocks/[height]/route.ts`
- `app/api/explorer/transactions/route.ts`
- `app/api/explorer/transactions/[hash]/route.ts`
- `app/api/explorer/overview/route.ts`
- `app/api/explorer/trending/route.ts`
- `app/api/explorer/addresses/[address]/route.ts`
- `app/api/explorer/search/route.ts`
- `app/api/validators/route.ts`
- `app/api/validators/[address]/route.ts`
- `app/api/validators/[address]/export/route.ts`
- `app/explorer/page.tsx`

### Modified:
- `lib/api/explorer.ts` - Added React Query hooks
- `lib/api/validators.ts` - Added React Query hooks
- `lib/api/client.ts` - Added trailing slash removal interceptor
- `lib/config/api.ts` - Updated baseURL configuration
- `components/explorer/explorer-dashboard.tsx` - Removed mockup, added React Query
- `components/explorer/block-details.tsx` - Complete rewrite with real data
- `next.config.mjs` - Updated rewrites configuration
- `types/blocks.ts` - Extended with all API fields

## Notes

- All API routes handle both Promise and direct params for Next.js 15 compatibility
- React Query hooks use 30-second stale time by default
- All data is now fetched from real backend endpoints
- No mockup or sample data remains in the codebase
- Proper error handling and loading states throughout

