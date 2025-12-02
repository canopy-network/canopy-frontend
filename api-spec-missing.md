# API Specification - Missing Properties

This document tracks properties that are used in the frontend but are not available in the API responses.

## GET /api/v1/explorer/transactions

### Missing Properties

The following properties are used in the frontend but are not returned by the API:

1. **chain_name** (string)
   - **Usage**: Displayed in the "Chain Name" column of the Recent Transactions table
   - **Current Implementation**: Hardcoded as "blockchain" with `data-sample="chain-name"` attribute
   - **Location**: `components/explorer/recent-transactions.tsx:92`
   - **Note**: The API only returns `chain_id`, but the UI needs the chain name for display

2. **chain_logo** (string, URL)
   - **Usage**: Displayed as the chain icon/logo in the Recent Transactions table
   - **Current Implementation**: Placeholder image with `data-sample="chain-logo"` attribute
   - **Location**: `components/explorer/recent-transactions.tsx:84-90`
   - **Note**: The API doesn't provide chain logo/image URLs

3. **relative_time** (string)
   - **Usage**: Displayed in the "Time" column showing human-readable relative time (e.g., "1 minute ago")
   - **Current Implementation**: Hardcoded as "1 minute ago" with `data-sample="relative-time"` attribute
   - **Location**: `components/explorer/recent-transactions.tsx:124`
   - **Note**: The API provides `timestamp` (ISO 8601), but the UI needs formatted relative time. This can be computed client-side from the timestamp.

4. **latest_update_time** (string)
   - **Usage**: Displayed in the header showing when the data was last updated
   - **Current Implementation**: Hardcoded as "Latest update 44 secs ago" with `data-sample="latest-update-time"` attribute
   - **Location**: `components/explorer/recent-transactions.tsx:46`
   - **Note**: This is a UI concern and could be computed from the most recent transaction timestamp or a separate endpoint for data freshness

### Properties Successfully Mapped

The following properties from the API are successfully mapped and used:

- ✅ `chain_id` → `chain_id`
- ✅ `height` → `height`
- ✅ `tx_hash` → `tx_hash`
- ✅ `timestamp` → `timestamp`
- ✅ `message_type` → `message_type`
- ✅ `signer` → `signer`
- ✅ `counterparty` → `counterparty`
- ✅ `amount` → `amount`
- ✅ `fee` → `fee`

## GET /api/v1/explorer/transactions/{hash}

### Missing Properties

Same as above for the transaction detail endpoint. The detail endpoint includes `message_json` which is useful for displaying full transaction details, but still lacks:

1. **chain_name** (string)
2. **chain_logo** (string, URL)
3. **relative_time** (string) - Can be computed from timestamp

### Additional Notes

- The `message_json` property is available in the detail endpoint and can be used to display full transaction message details
- All other optional properties (validator_address, dest_chain_id, order_id, pool_id, etc.) are properly optional and handled correctly

## GET /api/v1/explorer/blocks

### Missing Properties

The following properties are used in the frontend but are not returned by the API:

1. **block_reward** (number/string)
   - **Usage**: Displayed in the "Reward" column of the Recent Blocks table
   - **Current Implementation**: Sample data with `data-sample="block-reward"` attribute
   - **Location**: `components/explorer/recent-blocks.tsx:309-314`
   - **Note**: The API returns `total_fees` but not the block reward/proposer reward amount

### Properties Successfully Mapped

The following properties from the API are successfully mapped and used:

- ✅ `chain_id` → `chain_id`
- ✅ `height` → `height` (mapped to `number` for display)
- ✅ `hash` → `hash`
- ✅ `timestamp` → `timestamp` (converted from ISO 8601 string to number)
- ✅ `proposer_address` → `block_producer`
- ✅ `num_txs` → `transactions`
- ✅ `num_events` → available but not displayed in recent blocks table
- ✅ `total_fees` → available but not displayed in recent blocks table

## GET /api/v1/explorer/blocks/{height}

### Missing Properties

Same as above for the block detail endpoint. The detail endpoint includes comprehensive transaction and event type counters, but still lacks:

1. **block_reward** (number/string) - Block proposer reward amount

### Additional Notes

- The detail endpoint provides extensive transaction type breakdowns (num_txs_send, num_txs_stake, etc.) and event type breakdowns (num_events_reward, num_events_slash, etc.)
- All transaction and event counters are properly available in the detail response

