import { chainsApi, walletTransactionApi } from "@/lib/api";
import { createAndSignTransaction, createEditStakeMessage, createStakeMessage } from "@/lib/crypto/transaction";
import { generateChainColor } from "@/lib/utils/chain-ui-helpers";
import type { Chain } from "@/types/chains";
import type { LocalWallet } from "@/types/wallet";

export type ChainId = number;

export interface CommitteeOption {
  chainId: ChainId;
  name: string;
  symbol: string;
  color: string;
  isActive?: boolean;
}

export const normalizeChainId = (chain: Chain | string | number | null | undefined): ChainId => {
  if (typeof chain === "number") return chain;
  if (typeof chain === "string") {
    const match = chain.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
  if (chain?.chain_id) {
    const match = chain.chain_id.toString().match(/\d+/);
    if (match) return Number(match[0]);
  }
  if (chain?.id) {
    const match = chain.id.toString().match(/\d+/);
    if (match) return Number(match[0]);
  }
  return 0;
};

export const mergeCommittees = (
  activeChainId: ChainId,
  committees: ChainId[],
  includeActive = true
): ChainId[] => {
  const base = includeActive ? [activeChainId, ...committees] : committees;
  return Array.from(new Set(base.filter((id) => Number(id) > 0)));
};

export const buildCommitteeOptions = (
  allChains: Chain[],
  activeChainId?: ChainId
): CommitteeOption[] => {
  const options = allChains
    .map((chain) => {
      const chainId = normalizeChainId(chain);
      if (!chainId) return null;
      return {
        chainId,
        name: chain.chain_name || `Chain ${chainId}`,
        symbol: chain.token_symbol || `C${String(chainId).padStart(3, "0")}`,
        color: chain.brand_color || generateChainColor(chain.chain_name || String(chainId)),
        isActive: activeChainId === chainId,
      };
    })
    .filter((c): c is CommitteeOption => Boolean(c));

  // Move active chain to the top (if present), otherwise sort by chainId
  const withActiveFirst = options.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return a.chainId - b.chainId;
  });

  // Remove duplicates by chainId (prefer the first occurrence)
  const seen = new Set<number>();
  const unique: CommitteeOption[] = [];
  for (const opt of withActiveFirst) {
    if (!seen.has(opt.chainId)) {
      seen.add(opt.chainId);
      unique.push(opt);
    }
  }

  return unique;
};

export const calcApy = (chainId: ChainId): number => 8 + (chainId % 8);

export const calcProjectedInterest = (amount: number, apy: number): number =>
  amount * (apy / 100);

export const estimateStakeFee = async (params: {
  fromAddress: string;
  amount: string;
  chainId: ChainId;
}) => {
  const { fromAddress, amount, chainId } = params;
  const feeResponse = await walletTransactionApi.estimateFee({
    transaction_type: "stake",
    from_address: fromAddress,
    to_address: fromAddress,
    amount,
    chain_id: chainId,
  });
  return feeResponse.estimated_fee;
};

export const buildStakeTx = async (params: {
  mode: "create" | "edit";
  wallet: LocalWallet;
  chainId: ChainId;
  amountMicro: number;
  committees: ChainId[];
  autoCompound: boolean;
  fee: number;
  memo?: string;
  networkId?: number;
  height?: number;
}) => {
  const {
    mode,
    wallet,
    chainId,
    amountMicro,
    committees,
    autoCompound,
    fee,
    memo = " ",
    networkId = 1,
  } = params;

  const height =
    params.height ??
    (await chainsApi.getChainHeight(String(chainId))).data.height;

  const msg =
    mode === "edit"
      ? createEditStakeMessage(
          wallet.address,
          amountMicro,
          committees,
          "",
          wallet.address,
          autoCompound
        )
      : createStakeMessage(
          wallet.public_key,
          amountMicro,
          committees,
          "",
          wallet.address,
          true,
          autoCompound
        );

  const type = mode === "edit" ? "editStake" : "stake";

  return createAndSignTransaction(
    {
      type,
      msg,
      fee: Number(fee) || 0,
      memo,
      networkID: networkId,
      chainID: chainId,
      height,
    },
    wallet.privateKey!,
    wallet.public_key,
    wallet.curveType as any
  );
};
