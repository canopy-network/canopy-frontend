import { Container } from "@/components/layout/container";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { getExplorerTransaction, Transaction } from "@/lib/api/explorer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface TransactionPageProps {
  params: Promise<{
    id: string;
  }>;
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

    // Handle both wrapped and unwrapped responses
    const transaction: Transaction =
      "data" in apiTransaction && apiTransaction.data
        ? apiTransaction.data
        : (apiTransaction as Transaction);

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
