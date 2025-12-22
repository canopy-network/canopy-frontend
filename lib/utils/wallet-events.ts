import {
  RewardRecord,
  RewardSource,
  WalletEventBase,
} from "@/types/wallet-events";
import { fromMicroUnits } from "@/lib/utils/denomination";

const DEFAULT_REWARD_KEYWORDS = [
  "reward",
  "rewards",
  "restake",
  "compound",
  "autocompound",
  "auto-compound",
  "distribution",
  "yield",
];

const DEFAULT_WITHDRAWAL_KEYWORDS = [
  "withdraw",
  "withdrawal",
  "payout",
  "transfer",
  "payout",
];

const COMPOUND_KEYWORDS = ["compound", "restake", "auto"];

export interface RewardExtractionOptions {
  stakePositionId?: string;
  validator?: string;
  token?: string;
  chainId?: number;
  relatedStakeKey?: string;
  typeKeywords?: string[];
  withdrawalTypeKeywords?: string[];
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function parsePossibleAmount(
  value: unknown,
  fallback?: unknown
): number | null {
  const candidate =
    value ??
    (typeof fallback === "object" && fallback !== null
      ? (fallback as any)?.amount ?? (fallback as any)?.value
      : fallback);

  if (candidate === undefined || candidate === null) return null;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDisplayUnits(microAmount: number): number {
  // Backend sends micro units; convert to standard units for UI/logic
  const converted = parseFloat(fromMicroUnits(microAmount, 6));
  return Number.isFinite(converted) ? converted : 0;
}

function inferRelatedStakeKey(event: WalletEventBase): string | undefined {
  const meta = event.metadata || {};
  const possibleKeys = [
    meta["stake_position_id"],
    meta["position_id"],
    meta["validator"],
    meta["validator_address"],
    meta["delegation_id"],
    meta["pool_id"],
    event.chain_id,
  ]
    .map(safeString)
    .filter(Boolean);

  return possibleKeys[0];
}

function detectSource(
  event: WalletEventBase,
  withdrawalKeywords: string[],
  compoundKeywords: string[]
): RewardSource {
  const typeText = safeString(event.type).toLowerCase();
  const metadataText = safeString(
    `${(event.metadata?.["reason"] as string) || ""} ${
      (event.metadata?.["source"] as string) || ""
    } ${(event.metadata?.["category"] as string) || ""}`
  ).toLowerCase();
  const combined = `${typeText} ${metadataText}`;

  if (compoundKeywords.some((kw) => combined.includes(kw))) {
    return "autocompound";
  }

  if (withdrawalKeywords.some((kw) => combined.includes(kw))) {
    return "withdrawal";
  }

  // Fallback to direction if provided
  if (
    safeString(event.direction).toLowerCase() === "out" ||
    safeString(event.direction).toLowerCase() === "debit"
  ) {
    return "withdrawal";
  }

  return "unknown";
}

function isLikelyRewardEvent(
  event: WalletEventBase,
  rewardKeywords: string[],
  withdrawalKeywords: string[]
): boolean {
  const typeText = safeString(event.type).toLowerCase();
  const metadataText = safeString(
    `${(event.metadata?.["reason"] as string) || ""} ${
      (event.metadata?.["source"] as string) || ""
    } ${(event.metadata?.["category"] as string) || ""}`
  ).toLowerCase();
  const combined = `${typeText} ${metadataText}`;

  if (rewardKeywords.some((kw) => combined.includes(kw))) return true;
  if (withdrawalKeywords.some((kw) => combined.includes(kw))) return true;

  // Basic heuristic: positive amount flowing in
  const direction = safeString(event.direction).toLowerCase();
  if (direction === "in" || direction === "credit") return true;

  return false;
}

/**
 * Normalize raw wallet event to a stable shape.
 */
export function normalizeWalletEvent(raw: any): WalletEventBase {
  const metadata =
    raw?.metadata && typeof raw.metadata === "object" ? raw.metadata : {};

  const type =
    safeString(raw?.type || raw?.event_type || raw?.event || "unknown") ||
    "unknown";

  const txHash =
    raw?.txHash ||
    raw?.transaction_hash ||
    raw?.hash ||
    metadata["txHash"] ||
    metadata["transactionHash"];

  const timestampValue =
    raw?.timestamp ||
    raw?.time ||
    raw?.created_at ||
    raw?.block_time ||
    raw?.blockTimestamp;

  const amount =
    raw?.amount ??
    raw?.value ??
    metadata["amount"] ??
    metadata["value"] ??
    raw?.details?.amount;

  const token =
    raw?.token ||
    raw?.symbol ||
    raw?.currency ||
    metadata["token"] ||
    metadata["symbol"];

  const chainId =
    raw?.chain_id ??
    raw?.chainId ??
    metadata["chain_id"] ??
    metadata["chainId"];
  const chainName =
    raw?.chain_name ??
    raw?.chainName ??
    metadata["chain_name"] ??
    metadata["chainName"];

  const address =
    raw?.address ||
    raw?.wallet_address ||
    raw?.owner ||
    metadata["address"] ||
    metadata["wallet_address"];

  const id =
    raw?.id ||
    raw?.event_id ||
    raw?.uuid ||
    txHash ||
    `${type}-${timestampValue || Date.now()}`;

  const parsedTimestamp =
    typeof timestampValue === "string"
      ? timestampValue
      : new Date(
          typeof timestampValue === "number" ? timestampValue : Date.now()
        ).toISOString();

  return {
    id: safeString(id),
    timestamp: parsedTimestamp,
    txHash: txHash ? safeString(txHash) : undefined,
    type,
    amount: amount !== undefined ? safeString(amount) : undefined,
    token: token ? safeString(token) : undefined,
    address: address ? safeString(address) : undefined,
    chain_id:
      chainId !== undefined && chainId !== null
        ? Number(chainId)
        : undefined,
    direction: raw?.direction ?? metadata["direction"],
    status: raw?.status ?? metadata["status"],
    metadata: {
      ...metadata,
      chain_id: metadata["chain_id"] ?? chainId,
      chain_name: metadata["chain_name"] ?? chainName,
    } as Record<string, unknown>,
    raw,
  };
}

/**
 * Extract stake rewards from generic wallet events using heuristics.
 */
export function extractStakeRewards(
  events: WalletEventBase[],
  options?: RewardExtractionOptions
): RewardRecord[] {
  const rewardKeywords =
    options?.typeKeywords || DEFAULT_REWARD_KEYWORDS;
  const withdrawalKeywords =
    options?.withdrawalTypeKeywords || DEFAULT_WITHDRAWAL_KEYWORDS;

  const filtered = events
    .map((event) => {
      if (
        options?.token &&
        safeString(event.token).toLowerCase() !==
          safeString(options.token).toLowerCase()
      ) {
        return null;
      }

      if (!isLikelyRewardEvent(event, rewardKeywords, withdrawalKeywords)) {
        return null;
      }

      const rawAmount =
        parsePossibleAmount(event.amount, event.metadata) ?? 0;
      const amount = toDisplayUnits(rawAmount);
      if (!Number.isFinite(amount) || amount === 0) return null;

      // Optional chain filter
      if (
        options?.chainId !== undefined &&
        event.chain_id !== undefined &&
        Number(event.chain_id) !== Number(options.chainId)
      ) {
        return null;
      }

      const relatedStakeKey =
        options?.relatedStakeKey ||
        options?.stakePositionId ||
        inferRelatedStakeKey(event);

      const source = detectSource(
        event,
        withdrawalKeywords,
        COMPOUND_KEYWORDS
      );

      // If user asked for a specific validator/stake key, require a match
      if (options?.validator) {
        const validatorFromMeta = safeString(
          event.metadata?.["validator"] ||
            event.metadata?.["validator_address"] ||
            event.metadata?.["validator_id"]
        ).toLowerCase();

        if (
          validatorFromMeta &&
          !validatorFromMeta.includes(
            safeString(options.validator).toLowerCase()
          )
        ) {
          return null;
        }
      }

      const idCandidate = relatedStakeKey
        ? safeString(relatedStakeKey).toLowerCase()
        : "";

      if (
        options?.stakePositionId &&
        idCandidate &&
        !idCandidate.includes(
          safeString(options.stakePositionId).toLowerCase()
        )
      ) {
        return null;
      }

      return {
        timestamp: event.timestamp,
        amount,
        token: event.token,
        txHash: event.txHash,
        source,
        relatedStakeKey,
        rawType: event.type,
        metadata: event.metadata,
      } as RewardRecord;
    })
    .filter(Boolean) as RewardRecord[];

  return filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
