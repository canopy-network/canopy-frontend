# Order Book Flow

This document describes the complete flow of the Order Book system for exchanging CNPY for other currencies (USDC, USDT, etc.).

## Order Book Flow Summary

### 1. Sell Order (Seller)

- User with CNPY creates a sell order.
- Defines: amount of CNPY to sell and amount of USDC/USDT to receive.
- Sent through Canopy RPC to `/v1/tx` using `MessageCreateOrder`.
- CNPY is locked in escrow until someone buys.

### 2. Buy Order (Buyer) — 2 Steps

#### Step 1: Lock Order

- The buyer performs a **self-send of 0 tokens** on the Ethereum blockchain (USDC/USDT).
- Must embed a JSON in the transaction indicating it's a "lock order".
- The JSON must contain the `LockOrder` information:

```json
{
  "orderID": "...",
  "chainID": 123,
  "buyerReceiveAddress": "...", // Canopy address where CNPY will be received
  "buyerSendAddress": "...",     // Ethereum address from where USDC/USDT will be sent
  "buyerChainDeadline": 123456   // Block height deadline
}
```

- When the chain confirms, it adds fields to the order (buyer address).

#### Step 2: Buy Order (Close Order)

- The buyer sends the tokens (USDC/USDT) to the seller's address (indicated by the RPC).
- Must embed a JSON in the transaction indicating it's a "close order":

```json
{
  "orderID": "...",
  "chainID": 123,
  "closeOrder": true
}
```

- The CNPY oracle detects the JSON and completes the swap.

## Technical Details

### Sell Order Implementation

- **Endpoint**: `/v1/tx` (Canopy RPC)
- **Message Type**: `MessageCreateOrder`
- **Required fields**:
  - `chainId`: ID of the committee responsible for the counter asset (USDC/USDT)
  - `data`: Generic field for swap-specific functionality
  - `amountForSale`: Amount of uCNPY to sell (in escrow)
  - `requestedAmount`: Amount of counter asset the buyer must send
  - `sellerReceiveAddress`: Address where the seller will receive the counter asset
  - `sellersSendAddress`: Canopy address from where the seller is selling

### Lock Order Implementation

- **Blockchain**: Ethereum (or the counter asset blockchain)
- **Transaction type**: Self-send of 0 tokens
- **Embedded data**: JSON with `LockOrder` information
- **Purpose**: Express purchase intent and "claim" the order

### Close Order Implementation

- **Blockchain**: Ethereum (or the counter asset blockchain)
- **Transaction type**: Token transfer to seller
- **Embedded data**: JSON with `CloseOrder` information
- **Purpose**: Complete the swap and transfer CNPY from escrow to the buyer

## Data Structures

### LockOrder (certificate.proto)

```protobuf
message LockOrder {
  bytes order_id = 1;                    // @gotags: json:"orderID"
  uint64 chain_id = 2;                   // @gotags: json:"chainID"
  bytes buyer_receive_address = 3;        // @gotags: json:"buyerReceiveAddress"
  bytes buyer_send_address = 4;           // @gotags: json:"buyerSendAddress"
  uint64 buyer_chain_deadline = 5;       // @gotags: json:"buyerChainDeadline"
}
```

### CloseOrder (certificate.proto)

```protobuf
message CloseOrder {
  bytes order_id = 1;                    // @gotags: json:"orderID"
  uint64 chain_id = 2;                   // @gotags: json:"chainID"
  bool close_order = 3;                  // @gotags: json:"closeOrder"
}
```

### MessageCreateOrder (message.proto)

```protobuf
message MessageCreateOrder {
  uint64 ChainId = 1;                    // @gotags: json:"chainID"
  bytes data = 2;                         // @gotags: json:"data"
  uint64 AmountForSale = 3;               // @gotags: json:"amountForSale"
  uint64 RequestedAmount = 4;             // @gotags: json:"requestAmount"
  bytes SellerReceiveAddress = 5;         // @gotags: json:"sellerReceiveAddress"
  bytes SellersSendAddress = 6;           // @gotags: json:"sellersSendAddress"
  bytes OrderId = 7;                      // Auto-populated by backend
}
```

## Visual Flow

```
┌─────────────┐
│   Seller    │
│  (CNPY)     │
└──────┬──────┘
       │
       │ 1. Create Sell Order
       │    MessageCreateOrder → /v1/tx
       │
       ▼
┌─────────────────┐
│  Order Book     │
│  (Escrow CNPY)  │
└──────┬──────────┘
       │
       │ 2. Buyer selects order
       │
       ▼
┌─────────────┐
│   Buyer     │
│ (USDC/USDT) │
└──────┬──────┘
       │
       │ 3. Lock Order
       │    Self-send 0 tokens + JSON
       │    (LockOrder data)
       │
       ▼
┌─────────────────┐
│  Order Locked   │
│ (buyer address) │
└──────┬──────────┘
       │
       │ 4. Close Order
       │    Send tokens to seller + JSON
       │    (CloseOrder data)
       │
       ▼
┌─────────────────┐
│  Swap Complete  │
│  CNPY → Buyer   │
│  USDC → Seller  │
└─────────────────┘
```

## Important Notes

1. **Oracle Detection**: The CNPY oracle monitors transactions on counter asset blockchains (Ethereum, etc.) looking for embedded JSONs that indicate lock orders and close orders.

2. **Deadline**: The `buyerChainDeadline` is critical. If the buyer doesn't send the tokens before the deadline, the order is "un-claimed" and becomes available again.

3. **Self-send**: The lock order requires a self-send of 0 tokens, which allows embedding data without transferring real value.

4. **Escrow**: CNPY remains locked in escrow from when the order is created until the swap is completed or cancelled.

5. **Multi-order Selection**: The buyer can select multiple orders to purchase in a single transaction.

## References

- `public/proto/message.proto`: Definition of `MessageCreateOrder`
- `public/proto/certificate.proto`: Definition of `LockOrder` and `CloseOrder`
- `lib/crypto/protobuf.ts`: `encodeMessageCreateOrder` function
- `lib/crypto/transaction.ts`: `createOrderMessage` function
