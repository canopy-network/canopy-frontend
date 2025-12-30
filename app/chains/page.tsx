import { ChainDirectory } from "@/components/explorer/chain-directory";
import { getAllChains } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

export const revalidate = 120;

export default async function ChainsPage() {
  try {
    const response = await getAllChains({
      status: "graduated",
      include: "virtual_pool,graduated_pool,liquidity,holders",
      limit: 50,
    });

    let list: any = (response as any)?.data ?? response ?? [];
    if (list && typeof list === "object" && Array.isArray(list.data)) {
      list = list.data;
    }

    if (!Array.isArray(list)) {
      list = [];
    }

    list.sort((a: Chain, b: Chain) => {
      const getDate = (chain: Chain) => new Date((chain as any).graduation_time || chain.created_at || 0).getTime();

      return getDate(b) - getDate(a);
    });

    return <ChainDirectory chains={list} />;
  } catch (error) {
    console.error("Failed to fetch chains directory:", error);
    return <ChainDirectory chains={[]} />;
  }
}
