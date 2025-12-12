/**
 * Protobuf serialization for Canopy transactions
 *
 * This module provides EXACT protobuf encoding compatible with Canopy Go implementation.
 * The sign bytes must match EXACTLY what the backend generates, or signature verification fails.
 *
 * CRITICAL: The backend omits fields with default values from protobuf encoding.
 * We MUST do the same or the bytes won't match and signatures will be invalid.
 *
 * Protobuf default values that are OMITTED:
 * - string: "" (empty string)
 * - bytes: [] (empty Uint8Array or zero-length)
 * - int/uint: 0
 * - bool: false
 * - repeated: [] (empty array)
 *
 * References:
 * - canopy/lib/.proto/tx.proto - Transaction structure
 * - canopy/lib/.proto/message.proto - Message structures
 * - canopy/lib/tx.go:149-162 - GetSignBytes() implementation
 * - canopy-newest-version/fsm/message.pb.go - All message type definitions
 *
 * SUPPORTED MESSAGE TYPES (16 total):
 *
 * ┌─ Transfer ────────────────────────────────────────────────────────────┐
 * │ • MessageSend - Standard token transfer                               │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ Staking/Validator ───────────────────────────────────────────────────┐
 * │ • MessageStake - Register as validator                                │
 * │ • MessageEditStake - Modify validator settings                        │
 * │ • MessageUnstake - Exit validator network                             │
 * │ • MessagePause - Temporarily pause validator                          │
 * │ • MessageUnpause - Resume paused validator                            │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ Governance ──────────────────────────────────────────────────────────┐
 * │ • MessageChangeParameter - Propose parameter change                   │
 * │ • MessageDAOTransfer - Propose DAO treasury transfer                  │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ System ──────────────────────────────────────────────────────────────┐
 * │ • MessageSubsidy - Subsidize committee treasury                       │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ DEX Legacy ──────────────────────────────────────────────────────────┐
 * │ • MessageCreateOrder - Create token swap order                        │
 * │ • MessageEditOrder - Edit existing order                              │
 * │ • MessageDeleteOrder - Delete order                                   │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ DEX v2 (NEW) ────────────────────────────────────────────────────────┐
 * │ • MessageDexLimitOrder - Create limit order (NEW)                     │
 * │ • MessageDexLiquidityDeposit - Add liquidity (NEW)                    │
 * │ • MessageDexLiquidityWithdraw - Remove liquidity (NEW)                │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * USAGE EXAMPLE:
 *
 * ```typescript
 * import { getSignBytesProtobuf } from './protobuf';
 * import { signMessage } from './signing';
 *
 * // 1. Build unsigned transaction
 * const tx = {
 *   type: 'dexLimitOrder',  // Use the message type
 *   msg: {
 *     chainId: 1,
 *     amountForSale: 1000000,
 *     requestedAmount: 2000000,
 *     address: 'abc123...',  // hex, no 0x prefix
 *   },
 *   time: Date.now() * 1000,  // Unix microseconds
 *   createdHeight: 12345,
 *   fee: 1000,
 *   memo: '',  // IMPORTANT: Always provide string, even if empty
 *   networkID: 1,
 *   chainID: 1,
 * };
 *
 * // 2. Get sign bytes (protobuf-encoded)
 * const signBytes = getSignBytesProtobuf(tx);
 *
 * // 3. Sign with private key
 * const signature = signMessage(signBytes, privateKeyHex, curveType);
 *
 * // 4. Attach signature and send to backend
 * const signedTx = {
 *   ...tx,
 *   signature: {
 *     publicKey: publicKeyHex,
 *     signature: signatureHex,
 *   },
 * };
 * ```
 */

import protobuf from 'protobufjs';
import { hexToBytes } from '@noble/hashes/utils.js';

/**
 * Helper function to check if a value should be omitted from protobuf encoding
 * (i.e., it's a default value that the backend would omit)
 */
function shouldOmit(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value === '') return true;
  if (value instanceof Uint8Array && value.length === 0) return true;
  if (typeof value === 'number' && value === 0) return true;
  if (typeof value === 'boolean' && !value) return true;
  return Array.isArray(value) && value.length === 0;

}

/**
 * Protobuf root containing all message definitions
 * Created dynamically to avoid need for .proto file compilation
 *
 * ALL field IDs and types MUST match canopy/fsm/message.pb.go exactly
 */
const root = protobuf.Root.fromJSON({
  nested: {
    types: {
      nested: {
        // Transaction message (from tx.proto)
        Transaction: {
          fields: {
            message_type: { type: 'string', id: 1 },
            msg: { type: 'google.protobuf.Any', id: 2 },
            signature: { type: 'Signature', id: 3 },
            created_height: { type: 'uint64', id: 4 },
            time: { type: 'uint64', id: 5 },
            fee: { type: 'uint64', id: 6 },
            memo: { type: 'string', id: 7 },
            network_id: { type: 'uint64', id: 8 },
            chain_id: { type: 'uint64', id: 9 },
          },
        },
        // Signature message (from tx.proto)
        Signature: {
          fields: {
            public_key: { type: 'bytes', id: 1 },
            signature: { type: 'bytes', id: 2 },
          },
        },
        // MessageSend - Standard token transfer
        MessageSend: {
          fields: {
            from_address: { type: 'bytes', id: 1 },
            to_address: { type: 'bytes', id: 2 },
            amount: { type: 'uint64', id: 3 },
          },
        },
        // MessageStake - Validator registration
        MessageStake: {
          fields: {
            public_key: { type: 'bytes', id: 1 },
            amount: { type: 'uint64', id: 2 },
            committees: { type: 'uint64', id: 3, rule: 'repeated', options: { packed: true } },
            net_address: { type: 'string', id: 4 },
            output_address: { type: 'bytes', id: 5 },
            delegate: { type: 'bool', id: 6 },
            compound: { type: 'bool', id: 7 },
            signer: { type: 'bytes', id: 8 },
          },
        },
        // MessageEditStake - Validator modification
        MessageEditStake: {
          fields: {
            address: { type: 'bytes', id: 1 },
            amount: { type: 'uint64', id: 2 },
            committees: { type: 'uint64', id: 3, rule: 'repeated', options: { packed: true } },
            net_address: { type: 'string', id: 4 },
            output_address: { type: 'bytes', id: 5 },
            compound: { type: 'bool', id: 6 },
            signer: { type: 'bytes', id: 7 },
          },
        },
        // MessageUnstake - Validator exit
        MessageUnstake: {
          fields: {
            address: { type: 'bytes', id: 1 },
          },
        },
        // MessagePause - Validator pause
        MessagePause: {
          fields: {
            address: { type: 'bytes', id: 1 },
          },
        },
        // MessageUnpause - Validator unpause
        MessageUnpause: {
          fields: {
            address: { type: 'bytes', id: 1 },
          },
        },
        // MessageChangeParameter - Governance proposal for parameter changes
        MessageChangeParameter: {
          fields: {
            parameter_space: { type: 'string', id: 1 },
            parameter_key: { type: 'string', id: 2 },
            parameter_value: { type: 'google.protobuf.Any', id: 3 },
            start_height: { type: 'uint64', id: 4 },
            end_height: { type: 'uint64', id: 5 },
            signer: { type: 'bytes', id: 6 },
            proposal_hash: { type: 'string', id: 7 },
          },
        },
        // MessageDAOTransfer - DAO treasury transfer proposal
        MessageDAOTransfer: {
          fields: {
            address: { type: 'bytes', id: 1 },
            amount: { type: 'uint64', id: 2 },
            start_height: { type: 'uint64', id: 4 },
            end_height: { type: 'uint64', id: 5 },
            proposal_hash: { type: 'string', id: 6 },
          },
        },
        // MessageSubsidy - Committee subsidy transfer
        MessageSubsidy: {
          fields: {
            address: { type: 'bytes', id: 1 },
            chain_id: { type: 'uint64', id: 2 },
            amount: { type: 'uint64', id: 3 },
            opcode: { type: 'bytes', id: 4 },
          },
        },
        // MessageCreateOrder - DEX create sell order
        MessageCreateOrder: {
          fields: {
            ChainId: { type: 'uint64', id: 1 },
            data: { type: 'bytes', id: 2 },
            AmountForSale: { type: 'uint64', id: 3 },
            RequestedAmount: { type: 'uint64', id: 4 },
            SellerReceiveAddress: { type: 'bytes', id: 5 },
            SellersSendAddress: { type: 'bytes', id: 6 },
            OrderId: { type: 'bytes', id: 7 },
          },
        },
        // MessageEditOrder - DEX edit sell order
        MessageEditOrder: {
          fields: {
            OrderId: { type: 'bytes', id: 1 },
            ChainId: { type: 'uint64', id: 2 },
            data: { type: 'bytes', id: 3 },
            AmountForSale: { type: 'uint64', id: 4 },
            RequestedAmount: { type: 'uint64', id: 5 },
            SellerReceiveAddress: { type: 'bytes', id: 6 },
          },
        },
        // MessageDeleteOrder - DEX delete sell order
        MessageDeleteOrder: {
          fields: {
            OrderId: { type: 'bytes', id: 1 },
            ChainId: { type: 'uint64', id: 2 },
          },
        },
        // MessageDexLimitOrder - DEX limit order
        MessageDexLimitOrder: {
          fields: {
            chain_id: { type: 'uint64', id: 1 },
            amount_for_sale: { type: 'uint64', id: 2 },
            requested_amount: { type: 'uint64', id: 3 },
            sellerReceiveAddress: { type: 'bytes', id: 4 },
            OrderId: { type: 'bytes', id: 5 },
          },
        },
        // MessageDexLiquidityDeposit - DEX liquidity deposit
        MessageDexLiquidityDeposit: {
          fields: {
            chain_id: { type: 'uint64', id: 1 },
            amount: { type: 'uint64', id: 2 },
            address: { type: 'bytes', id: 3 },
            OrderId: { type: 'bytes', id: 4 },
          },
        },
        // MessageDexLiquidityWithdraw - DEX liquidity withdraw
        MessageDexLiquidityWithdraw: {
          fields: {
            chain_id: { type: 'uint64', id: 1 },
            percent: { type: 'uint64', id: 2 },
            address: { type: 'bytes', id: 3 },
            OrderId: { type: 'bytes', id: 4 },
          },
        },
      },
    },
    google: {
      nested: {
        protobuf: {
          nested: {
            // google.protobuf.Any
            Any: {
              fields: {
                type_url: { type: 'string', id: 1 },
                value: { type: 'bytes', id: 2 },
              },
            },
          },
        },
      },
    },
  },
});

// Lookup all message types
const Transaction = root.lookupType('types.Transaction');
const MessageSend = root.lookupType('types.MessageSend');
const MessageStake = root.lookupType('types.MessageStake');
const MessageEditStake = root.lookupType('types.MessageEditStake');
const MessageUnstake = root.lookupType('types.MessageUnstake');
const MessagePause = root.lookupType('types.MessagePause');
const MessageUnpause = root.lookupType('types.MessageUnpause');
const MessageChangeParameter = root.lookupType('types.MessageChangeParameter');
const MessageDAOTransfer = root.lookupType('types.MessageDAOTransfer');
const MessageSubsidy = root.lookupType('types.MessageSubsidy');
const MessageCreateOrder = root.lookupType('types.MessageCreateOrder');
const MessageEditOrder = root.lookupType('types.MessageEditOrder');
const MessageDeleteOrder = root.lookupType('types.MessageDeleteOrder');
const MessageDexLimitOrder = root.lookupType('types.MessageDexLimitOrder');
const MessageDexLiquidityDeposit = root.lookupType('types.MessageDexLiquidityDeposit');
const MessageDexLiquidityWithdraw = root.lookupType('types.MessageDexLiquidityWithdraw');

/**
 * Creates a google.protobuf.Any from a message
 * Mirrors: canopy/lib/util.go:354-364 (NewAny function)
 *
 * @param messageTypeName - Fully qualified type name (e.g., "types.MessageSend")
 * @param messageBytes - Protobuf-encoded message bytes
 * @returns google.protobuf.Any object
 */
function createAny(messageTypeName: string, messageBytes: Uint8Array): any {
  return {
    type_url: `type.googleapis.com/${messageTypeName}`,
    value: messageBytes,
  };
}

// ============================================================================
// MESSAGE ENCODING FUNCTIONS
// Each function encodes a specific message type to protobuf bytes
// ============================================================================

/**
 * Encodes MessageSend - Standard token transfer
 */
export function encodeMessageSend(
  fromAddress: string,
  toAddress: string,
  amount: number
): Uint8Array {
  const message = MessageSend.create({
    from_address: hexToBytes(fromAddress),
    to_address: hexToBytes(toAddress),
    amount: amount,
  });
  return MessageSend.encode(message).finish();
}

/**
 * Encodes MessageStake - Validator registration
 *
 * Backend reference: canopy/fsm/transaction.go:270-278
 *
 * CRITICAL: Although backend specifies all fields in the struct, protobuf automatically
 * omits default values during serialization. We must match this behavior:
 * - Omit netAddress if empty string ""
 * - Omit delegate if false
 * - Omit compound if false
 * - NEVER include Signer (backend never sets this)
 *
 * WORKAROUND: Backend has a bug in canopy/fsm/message_helpers.go:149
 * It expects "publickey" (lowercase) instead of "publicKey" (camelCase)
 */
export function encodeMessageStake(params: {
  publickey: string;     // REQUIRED - WORKAROUND: lowercase to match backend bug
  amount: number;        // REQUIRED
  committees: number[];  // REQUIRED
  netAddress: string;    // REQUIRED (can be empty string for delegation)
  outputAddress: string; // REQUIRED
  delegate: boolean;     // REQUIRED
  compound: boolean;     // REQUIRED
  signer?: string;       // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    public_key: hexToBytes(params.publickey),
    amount: params.amount,
    committees: params.committees,
    output_address: hexToBytes(params.outputAddress),
  };

  // Protobuf omits default values - we must match this behavior
  if (!shouldOmit(params.netAddress)) messageData.net_address = params.netAddress;
  if (!shouldOmit(params.delegate)) messageData.delegate = params.delegate;
  if (!shouldOmit(params.compound)) messageData.compound = params.compound;

  // NEVER include signer - backend never sets this field

  const message = MessageStake.create(messageData);
  return MessageStake.encode(message).finish();
}

/**
 * Encodes MessageEditStake - Validator modification
 *
 * Backend reference: canopy/fsm/transaction.go:283-290
 *
 * CRITICAL: Protobuf automatically omits default values during serialization.
 * We must match this behavior by using shouldOmit() for optional fields.
 */
export function encodeMessageEditStake(params: {
  address: string;       // REQUIRED
  amount: number;        // REQUIRED
  committees: number[];  // REQUIRED
  netAddress: string;    // REQUIRED (can be empty)
  outputAddress: string; // REQUIRED
  compound: boolean;     // REQUIRED
  signer?: string;       // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    address: hexToBytes(params.address),
    output_address: hexToBytes(params.outputAddress),
  };

  // Protobuf omits default values - we must match this behavior
  if (!shouldOmit(params.amount)) messageData.amount = params.amount;
  if (!shouldOmit(params.committees)) messageData.committees = params.committees;
  if (!shouldOmit(params.netAddress)) messageData.net_address = params.netAddress;
  if (!shouldOmit(params.compound)) messageData.compound = params.compound;

  // NEVER include signer

  const message = MessageEditStake.create(messageData);
  return MessageEditStake.encode(message).finish();
}

/**
 * Encodes MessageUnstake - Validator exit
 */
export function encodeMessageUnstake(address: string): Uint8Array {
  const message = MessageUnstake.create({
    address: hexToBytes(address),
  });
  return MessageUnstake.encode(message).finish();
}

/**
 * Encodes MessagePause - Validator pause
 */
export function encodeMessagePause(address: string): Uint8Array {
  const message = MessagePause.create({
    address: hexToBytes(address),
  });
  return MessagePause.encode(message).finish();
}

/**
 * Encodes MessageUnpause - Validator unpause
 */
export function encodeMessageUnpause(address: string): Uint8Array {
  const message = MessageUnpause.create({
    address: hexToBytes(address),
  });
  return MessageUnpause.encode(message).finish();
}

/**
 * Encodes MessageChangeParameter - Governance parameter change proposal
 *
 * Backend reference: canopy/fsm/transaction.go:314-321 (uint64) and 330-337 (string)
 *
 * CRITICAL: Backend ALWAYS sets Signer field with address, so we must include it.
 * Protobuf will omit other default values automatically.
 */
export function encodeMessageChangeParameter(params: {
  parameterSpace: string;                                     // REQUIRED
  parameterKey: string;                                       // REQUIRED
  parameterValue: { typeUrl: string; value: Uint8Array };    // REQUIRED
  startHeight: number;                                        // REQUIRED
  endHeight: number;                                          // REQUIRED
  signer: string;                                             // REQUIRED - backend ALWAYS includes this with address
  proposalHash?: string;                                      // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    parameter_space: params.parameterSpace,
    parameter_key: params.parameterKey,
    parameter_value: createAny(params.parameterValue.typeUrl, params.parameterValue.value),
    start_height: params.startHeight,
    end_height: params.endHeight,
    signer: hexToBytes(params.signer),  // Backend always sets this
  };

  // NEVER include proposal_hash - backend never sets this field

  const message = MessageChangeParameter.create(messageData);
  return MessageChangeParameter.encode(message).finish();
}

/**
 * Encodes MessageDAOTransfer - DAO treasury transfer proposal
 *
 * Backend reference: canopy/fsm/transaction.go:342-347
 * Fields included: Address, Amount, StartHeight, EndHeight
 * Fields NEVER included: ProposalHash (backend never sets this)
 */
export function encodeMessageDAOTransfer(params: {
  address: string;       // REQUIRED
  amount: number;        // REQUIRED
  startHeight: number;   // REQUIRED
  endHeight: number;     // REQUIRED
  proposalHash?: string; // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    address: hexToBytes(params.address),
    amount: params.amount,
    start_height: params.startHeight,
    end_height: params.endHeight,
  };

  // NEVER include proposal_hash - backend never sets this field

  const message = MessageDAOTransfer.create(messageData);
  return MessageDAOTransfer.encode(message).finish();
}

/**
 * Encodes MessageSubsidy - Committee subsidy transfer
 *
 * Backend reference: canopy/fsm/transaction.go:357-362
 * Fields included: Address, ChainId, Amount, Opcode
 */
export function encodeMessageSubsidy(params: {
  address: string;  // REQUIRED
  chainId: number;  // REQUIRED
  amount: number;   // REQUIRED
  opcode: string;   // REQUIRED - hex string
}): Uint8Array {
  const messageData: any = {
    address: hexToBytes(params.address),
    chain_id: params.chainId,  // Always include
    amount: params.amount,
    opcode: hexToBytes(params.opcode),  // Always include
  };

  const message = MessageSubsidy.create(messageData);
  return MessageSubsidy.encode(message).finish();
}

/**
 * Encodes MessageCreateOrder - DEX create sell order
 *
 * Backend reference: canopy/fsm/transaction.go:367-374
 * Fields included: ChainId, Data, AmountForSale, RequestedAmount, SellerReceiveAddress, SellersSendAddress
 * Fields NEVER included: OrderId (backend never sets this, gets auto-populated)
 */
export function encodeMessageCreateOrder(params: {
  chainId: number;              // REQUIRED
  data: string;                 // REQUIRED - hex string (can be empty)
  amountForSale: number;        // REQUIRED
  requestedAmount: number;      // REQUIRED
  sellerReceiveAddress: string; // REQUIRED
  sellersSendAddress: string;   // REQUIRED
  orderId?: string;             // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    ChainId: params.chainId,  // Always include
    AmountForSale: params.amountForSale,
    RequestedAmount: params.requestedAmount,
    SellerReceiveAddress: hexToBytes(params.sellerReceiveAddress),
    SellersSendAddress: hexToBytes(params.sellersSendAddress),
  };

  // Only include data if non-empty (protobuf omits empty byte arrays as default)
  if (!shouldOmit(params.data)) {
    messageData.data = hexToBytes(params.data);
  }

  // NEVER include OrderId - backend never sets this field

  const message = MessageCreateOrder.create(messageData);
  return MessageCreateOrder.encode(message).finish();
}

/**
 * Encodes MessageEditOrder - DEX edit sell order
 *
 * Backend reference: canopy/fsm/transaction.go:383-390
 * Fields included: OrderId, ChainId, Data, AmountForSale, RequestedAmount, SellerReceiveAddress
 */
export function encodeMessageEditOrder(params: {
  orderId: string;              // REQUIRED
  chainId: number;              // REQUIRED
  data: string;                 // REQUIRED - hex string
  amountForSale: number;        // REQUIRED
  requestedAmount: number;      // REQUIRED
  sellerReceiveAddress: string; // REQUIRED
}): Uint8Array {
  const messageData: any = {
    OrderId: hexToBytes(params.orderId),
    ChainId: params.chainId,  // Always include
    data: hexToBytes(params.data),  // Always include
    AmountForSale: params.amountForSale,
    RequestedAmount: params.requestedAmount,
    SellerReceiveAddress: hexToBytes(params.sellerReceiveAddress),
  };

  const message = MessageEditOrder.create(messageData);
  return MessageEditOrder.encode(message).finish();
}

/**
 * Encodes MessageDeleteOrder - DEX delete sell order
 *
 * Backend reference: canopy/fsm/transaction.go:399-402
 * Fields included: OrderId, ChainId
 */
export function encodeMessageDeleteOrder(params: {
  orderId: string; // REQUIRED
  chainId: number; // REQUIRED
}): Uint8Array {
  const messageData: any = {
    OrderId: hexToBytes(params.orderId),
    ChainId: params.chainId,  // Always include
  };

  const message = MessageDeleteOrder.create(messageData);
  return MessageDeleteOrder.encode(message).finish();
}

/**
 * Encodes MessageDexLimitOrder - DEX limit order
 *
 * From: canopy-newest-version/lib/.proto/message.proto:220-231
 *
 * This is the NEW DEX protocol limit order message.
 *
 * Fields included: chain_id, amount_for_sale, requested_amount, address
 * Fields NEVER included: OrderId (backend auto-populates)
 */
export function encodeMessageDexLimitOrder(params: {
  chainId: number;         // REQUIRED
  amountForSale: number;   // REQUIRED
  requestedAmount: number; // REQUIRED (minimum amount seller will receive)
  sellerReceiveAddress: string;         // REQUIRED - seller's send address (hex)
  orderId?: string;        // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    chain_id: params.chainId,
    amount_for_sale: params.amountForSale,
    requested_amount: params.requestedAmount,
    sellerReceiveAddress: hexToBytes(params.sellerReceiveAddress),
  };

  // NEVER include OrderId - backend auto-populates this field

  const message = MessageDexLimitOrder.create(messageData);
  return MessageDexLimitOrder.encode(message).finish();
}

/**
 * Encodes MessageDexLiquidityDeposit - DEX liquidity deposit
 *
 * From: canopy-newest-version/lib/.proto/message.proto:233-243
 *
 * Deposits tokens to the liquidity pool in exchange for liquidity points.
 *
 * Fields included: chain_id, amount, address
 * Fields NEVER included: OrderId (backend auto-populates)
 */
export function encodeMessageDexLiquidityDeposit(params: {
  chainId: number; // REQUIRED
  amount: number;  // REQUIRED
  address: string; // REQUIRED - address sending tokens (hex)
  orderId?: string; // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    chain_id: params.chainId,
    amount: params.amount,
    address: hexToBytes(params.address),
  };

  // NEVER include OrderId - backend auto-populates this field

  const message = MessageDexLiquidityDeposit.create(messageData);
  return MessageDexLiquidityDeposit.encode(message).finish();
}

/**
 * Encodes MessageDexLiquidityWithdraw - DEX liquidity withdraw
 *
 * From: canopy-newest-version/lib/.proto/message.proto:245-255
 *
 * Withdraws tokens from both liquidity pools in exchange for burning liquidity points.
 *
 * Fields included: chain_id, percent, address
 * Fields NEVER included: OrderId (backend auto-populates)
 */
export function encodeMessageDexLiquidityWithdraw(params: {
  chainId: number; // REQUIRED
  percent: number; // REQUIRED - percent of tokens to withdraw
  address: string; // REQUIRED - LP's address (hex)
  orderId?: string; // OPTIONAL - backend NEVER includes this, omit it
}): Uint8Array {
  const messageData: any = {
    chain_id: params.chainId,
    percent: params.percent,
    address: hexToBytes(params.address),
  };

  // NEVER include OrderId - backend auto-populates this field

  const message = MessageDexLiquidityWithdraw.create(messageData);
  return MessageDexLiquidityWithdraw.encode(message).finish();
}

// ============================================================================
// TRANSACTION SIGN BYTES GENERATION
// ============================================================================

/**
 * Gets the canonical sign bytes for a transaction
 * Mirrors: canopy/lib/tx.go:149-162 (GetSignBytes function)
 *
 * CRITICAL: This MUST produce the EXACT same bytes as the Go implementation,
 * or signature verification will fail.
 *
 * The sign bytes are the protobuf-encoded transaction WITHOUT the signature field.
 *
 * @param tx - Unsigned transaction object
 * @returns Protobuf-encoded sign bytes
 */
export function getSignBytesProtobuf(tx: {
  type: string;
  msg: any;
  time: number;
  createdHeight: number;
  fee: number;
  memo?: string;
  networkID: number;
  chainID: number;
}): Uint8Array {
  // Step 1: Encode the message payload based on type
  let msgBytes: Uint8Array;
  let msgTypeName: string;

  switch (tx.type) {
    case 'send':
      msgBytes = encodeMessageSend(
        tx.msg.fromAddress,
        tx.msg.toAddress,
        tx.msg.amount
      );
      msgTypeName = 'types.MessageSend';
      break;

    case 'stake':
      msgBytes = encodeMessageStake(tx.msg);
      msgTypeName = 'types.MessageStake';
      break;

    case 'editStake':
      msgBytes = encodeMessageEditStake(tx.msg);
      msgTypeName = 'types.MessageEditStake';
      break;

    case 'unstake':
      msgBytes = encodeMessageUnstake(tx.msg.address);
      msgTypeName = 'types.MessageUnstake';
      break;

    case 'pause':
      msgBytes = encodeMessagePause(tx.msg.address);
      msgTypeName = 'types.MessagePause';
      break;

    case 'unpause':
      msgBytes = encodeMessageUnpause(tx.msg.address);
      msgTypeName = 'types.MessageUnpause';
      break;

    case 'changeParameter':
      msgBytes = encodeMessageChangeParameter(tx.msg);
      msgTypeName = 'types.MessageChangeParameter';
      break;

    case 'daoTransfer':
      msgBytes = encodeMessageDAOTransfer(tx.msg);
      msgTypeName = 'types.MessageDAOTransfer';
      break;

    case 'MessageSubsidy':
      msgBytes = encodeMessageSubsidy(tx.msg);
      msgTypeName = 'types.MessageSubsidy';
      break;

    case 'createOrder':
      msgBytes = encodeMessageCreateOrder(tx.msg);
      msgTypeName = 'types.MessageCreateOrder';
      break;

    case 'editOrder':
      msgBytes = encodeMessageEditOrder(tx.msg);
      msgTypeName = 'types.MessageEditOrder';
      break;

    case 'deleteOrder':
      msgBytes = encodeMessageDeleteOrder(tx.msg);
      msgTypeName = 'types.MessageDeleteOrder';
      break;

    case 'dexLimitOrder':
      msgBytes = encodeMessageDexLimitOrder(tx.msg);
      msgTypeName = 'types.MessageDexLimitOrder';
      break;

    case 'dexLiquidityDeposit':
      msgBytes = encodeMessageDexLiquidityDeposit(tx.msg);
      msgTypeName = 'types.MessageDexLiquidityDeposit';
      break;

    case 'dexLiquidityWithdraw':
      msgBytes = encodeMessageDexLiquidityWithdraw(tx.msg);
      msgTypeName = 'types.MessageDexLiquidityWithdraw';
      break;

    default:
      throw new Error(`Unsupported message type: ${tx.type}`);
  }

  // Step 2: Wrap message in google.protobuf.Any
  const anyMsg = createAny(msgTypeName, msgBytes);

  // Step 3: Create transaction WITHOUT signature
  // Mirrors lib.Transaction.GetSignBytes() which sets Signature to nil
  const transactionData: any = {
    message_type: tx.type,
    msg: anyMsg,
    signature: null, // CRITICAL: signature must be null for sign bytes
    created_height: tx.createdHeight,
    time: tx.time,
    fee: tx.fee,
    network_id: tx.networkID,
    chain_id: tx.chainID,
  };

  // CRITICAL: Only include memo if it's not empty
  // The backend omits empty strings from protobuf
  if (!shouldOmit(tx.memo)) {
    transactionData.memo = tx.memo;
  }

  const transaction = Transaction.create(transactionData);

  // Step 4: Encode to protobuf bytes
  return Transaction.encode(transaction).finish();
}

/**
 * Encodes a complete signed transaction to protobuf
 * Used after signing to create the full transaction object
 *
 * NOTE: This is only needed if you want to send raw protobuf bytes.
 * For Launchpad, we send JSON and it does the proto conversion.
 *
 * @param tx - Complete transaction with signature
 * @returns Protobuf-encoded transaction bytes
 */
export function encodeSignedTransaction(tx: {
  type: string;
  msg: any;
  signature: {
    publicKey: string;
    signature: string;
  };
  time: number;
  createdHeight: number;
  fee: number;
  memo: string;
  networkID: number;
  chainID: number;
}): Uint8Array {
  // Encode the message payload (reuse getSignBytesProtobuf logic)
  const lunsignedTx = {
    type: tx.type,
    msg: tx.msg,
    time: tx.time,
    createdHeight: tx.createdHeight,
    fee: tx.fee,
    memo: tx.memo,
    networkID: tx.networkID,
    chainID: tx.chainID,
  };

  // Get the Any-wrapped message
  let msgBytes: Uint8Array;
  let msgTypeName: string;

  switch (tx.type) {
    case 'MessageSend':
      msgBytes = encodeMessageSend(tx.msg.fromAddress, tx.msg.toAddress, tx.msg.amount);
      msgTypeName = 'types.MessageSend';
      break;
    // ... (add other cases as needed)
    default:
      throw new Error(`Unsupported message type: ${tx.type}`);
  }

  const anyMsg = createAny(msgTypeName, msgBytes);

  // Create transaction WITH signature
  const transaction = Transaction.create({
    message_type: tx.type,
    msg: anyMsg,
    signature: {
      public_key: hexToBytes(tx.signature.publicKey),
      signature: hexToBytes(tx.signature.signature),
    },
    created_height: tx.createdHeight,
    time: tx.time,
    fee: tx.fee,
    memo: tx.memo ?? '',
    network_id: tx.networkID,
    chain_id: tx.chainID,
  });

  return Transaction.encode(transaction).finish();
}

/**
 * Verifies that our protobuf encoding matches expected format
 * Useful for debugging signature verification issues
 */
export function debugProtobufEncoding(tx: any): void {
  const signBytes = getSignBytesProtobuf(tx);

  console.log('=== Protobuf Encoding Debug ===');
  console.log('Transaction:', JSON.stringify(tx, null, 2));
  console.log('Sign bytes length:', signBytes.length);
  console.log('Sign bytes (hex):', Buffer.from(signBytes).toString('hex'));
  console.log('Sign bytes (base64):', Buffer.from(signBytes).toString('base64'));
}
