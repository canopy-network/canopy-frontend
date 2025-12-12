# Order Book Flow - Flujo del Order Book

Este documento describe el flujo completo del sistema de Order Book para intercambiar CNPY por otras monedas (USDC, USDT, etc.).

## Resumen del Flujo del Order Book

### 1. Sell Order (Vendedor)

- Usuario con CNPY crea una orden de venta.
- Define: cantidad de CNPY a vender y cantidad de USDC/USDT a recibir.
- Se envía a través del RPC de Canopy a `/v1/tx` usando `MessageCreateOrder`.
- Los CNPY se bloquean en escrow hasta que alguien compre.

### 2. Buy Order (Comprador) — 2 Pasos

#### Paso 1: Lock Order

- El comprador hace un **self-send de 0 tokens** en la blockchain de Ethereum (USDC/USDT).
- Debe incrustar un JSON en la transacción que indique que es un "lock order".
- El JSON debe contener la información del `LockOrder`:

```json
{
  "orderID": "...",
  "chainID": 123,
  "buyerReceiveAddress": "...", // Dirección Canopy donde recibirá CNPY
  "buyerSendAddress": "...",     // Dirección Ethereum desde donde enviará USDC/USDT
  "buyerChainDeadline": 123456   // Block height deadline
}
```

- Cuando el chain confirma, agrega campos a la orden (buyer address).

#### Paso 2: Buy Order (Close Order)

- El comprador envía los tokens (USDC/USDT) a la dirección del seller (indicada por el RPC).
- Debe incrustar un JSON en la transacción que indique que es un "close order":

```json
{
  "orderID": "...",
  "chainID": 123,
  "closeOrder": true
}
```

- El oracle de CNPY detecta el JSON y completa el swap.

## Detalles Técnicos

### Sell Order Implementation

- **Endpoint**: `/v1/tx` (Canopy RPC)
- **Message Type**: `MessageCreateOrder`
- **Campos requeridos**:
  - `chainId`: ID del committee responsable del counter asset (USDC/USDT)
  - `data`: Campo genérico para funcionalidad específica del swap
  - `amountForSale`: Cantidad de uCNPY a vender (en escrow)
  - `requestedAmount`: Cantidad del counter asset que el comprador debe enviar
  - `sellerReceiveAddress`: Dirección donde el seller recibirá el counter asset
  - `sellersSendAddress`: Dirección Canopy desde donde el seller está vendiendo

### Lock Order Implementation

- **Blockchain**: Ethereum (o la blockchain del counter asset)
- **Tipo de transacción**: Self-send de 0 tokens
- **Datos incrustados**: JSON con información del `LockOrder`
- **Propósito**: Expresar intención de compra y "reclamar" la orden

### Close Order Implementation

- **Blockchain**: Ethereum (o la blockchain del counter asset)
- **Tipo de transacción**: Envío de tokens al seller
- **Datos incrustados**: JSON con información del `CloseOrder`
- **Propósito**: Completar el swap y transferir los CNPY del escrow al comprador

## Estructuras de Datos

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

## Flujo Visual

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

## Notas Importantes

1. **Oracle Detection**: El oracle de CNPY monitorea las transacciones en las blockchains de counter assets (Ethereum, etc.) buscando los JSONs incrustados que indican lock orders y close orders.

2. **Deadline**: El `buyerChainDeadline` es crítico. Si el comprador no envía los tokens antes del deadline, la orden se "un-claims" y vuelve a estar disponible.

3. **Self-send**: El lock order requiere un self-send de 0 tokens, lo que permite incrustar datos sin transferir valor real.

4. **Escrow**: Los CNPY quedan bloqueados en escrow desde que se crea la orden hasta que se completa el swap o se cancela.

5. **Multi-order Selection**: El comprador puede seleccionar múltiples órdenes para comprar en una sola transacción.

## Referencias

- `public/proto/message.proto`: Definición de `MessageCreateOrder`
- `public/proto/certificate.proto`: Definición de `LockOrder` y `CloseOrder`
- `lib/crypto/protobuf.ts`: Función `encodeMessageCreateOrder`
- `lib/crypto/transaction.ts`: Función `createOrderMessage`

