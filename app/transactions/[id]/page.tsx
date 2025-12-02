import { Container } from "@/components/layout/container";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { getExplorerTransaction, Transaction } from "@/lib/api/explorer";
import { SampleTransaction } from "@/lib/demo-data/sample-transactions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface TransactionPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Transform API transaction to SampleTransaction format with sample data for missing fields
function transformTransaction(
  apiTransaction: Transaction | { data: Transaction },
  hash: string
): SampleTransaction {
  // Handle both wrapped and unwrapped responses
  const tx: Transaction =
    "data" in apiTransaction && apiTransaction.data
      ? apiTransaction.data
      : (apiTransaction as Transaction);

  // Generate sample data based on hash for consistency
  const seed = hash
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  // Sample chain data
  const sampleChain = {
    id: `chain-${tx.chain_id || 1}`,
    name: `Chain ${tx.chain_id || 1}`,
    ticker: "CNPY",
    branding: "",
  };

  // Map message_type to TransactionMethod
  const methodMap: Record<string, "Transfer" | "Swap" | "Stake" | "Contract"> =
    {
      transfer: "Transfer",
      swap: "Swap",
      stake: "Stake",
      dexLimitOrder: "Swap",
      certificateResults: "Contract",
    };
  const method = methodMap[tx.message_type?.toLowerCase()] || "Contract";

  // Generate sample addresses if not provided
  const fromAddress =
    tx.signer ||
    `0x${Array.from({ length: 40 })
      .map(() => Math.floor(seededRandom(0, 16, 1)).toString(16))
      .join("")}`;
  const toAddress =
    tx.counterparty ||
    `0x${Array.from({ length: 40 })
      .map(() => Math.floor(seededRandom(0, 16, 2)).toString(16))
      .join("")}`;

  // Sample amounts and fees
  const amountCnpy = tx.amount || seededRandom(1000, 100000, 3);
  const tokenAmount = tx.sell_amount || seededRandom(100, 10000, 4);
  const value = tx.buy_amount || seededRandom(500, 5000, 5);
  const gasUsed = seededRandom(21000, 100000, 6);
  const gasPriceGwei = seededRandom(20, 100, 7);
  const transactionFeeCnpy = tx.fee || seededRandom(1000, 50000, 8);

  // Sample internal transactions
  const internalTxCount = Math.floor(seededRandom(0, 3, 9));
  const internalTransactions = Array.from({ length: internalTxCount }).map(
    (_, i) => ({
      id: `${hash}-internal-${i}`,
      from: `0x${Array.from({ length: 40 })
        .map(() => Math.floor(seededRandom(0, 16, 10 + i)).toString(16))
        .join("")}`,
      to: `0x${Array.from({ length: 40 })
        .map(() => Math.floor(seededRandom(0, 16, 20 + i)).toString(16))
        .join("")}`,
      value: seededRandom(100, 1000, 30 + i),
      type: i % 2 === 0 ? ("call" as const) : ("transfer" as const),
    })
  );

  // Sample logs
  const logCount = Math.floor(seededRandom(2, 8, 40));
  const logs = Array.from({ length: logCount }).map((_, i) => {
    const topics = Array.from({ length: 3 })
      .map(
        () =>
          `0x${Array.from({ length: 64 })
            .map(() => Math.floor(seededRandom(0, 16, 50 + i)).toString(16))
            .join("")}`
      )
      .join(", ");
    return `Log ${i + 1}: ${topics}`;
  });

  return {
    id: hash,
    hash: hash,
    chain: sampleChain,
    blockHeight: tx.height || 0,
    method,
    from: fromAddress,
    to: toAddress,
    timestamp: tx.timestamp || new Date().toISOString(),
    amountCnpy,
    tokenAmount,
    value,
    gasUsed,
    gasPriceGwei,
    transactionFeeCnpy,
    internalTransactions,
    logs,
  };
}

export default async function TransactionPage({
  params,
}: TransactionPageProps) {
  const awaitedParams = await params;
  const transactionHash = decodeURIComponent(awaitedParams.id);

  try {
    // Fetch transaction from API
    const apiTransaction = await getExplorerTransaction(transactionHash);

    if (!apiTransaction) {
      notFound();
    }
    // Transform to SampleTransaction format with sample data for missing fields
    const transaction = transformTransaction(apiTransaction, transactionHash);

    return (
      <Container type="boxed" className="space-y-6 xl:px-0">
        <TransactionDetail transaction={transaction} />
      </Container>
    );
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    notFound();
  }
}
