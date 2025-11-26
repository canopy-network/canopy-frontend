import { Container } from "@/components/layout/container";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { getSampleTransaction } from "@/lib/demo-data/sample-transactions";
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
  const transaction = getSampleTransaction(transactionHash);

  if (!transaction) {
    notFound();
  }

  return (
    <Container type="boxed" className="space-y-6 xl:px-0">
      <TransactionDetail transaction={transaction} />
    </Container>
  );
}
