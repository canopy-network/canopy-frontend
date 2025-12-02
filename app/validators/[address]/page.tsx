import { Container } from "@/components/layout/container";
import { ValidatorDetail } from "@/components/validators/validator-detail";
import { getSampleValidatorByAddress } from "@/lib/demo-data/sample-validators";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ValidatorPageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function ValidatorPage({ params }: ValidatorPageProps) {
  const awaitedParams = await params;
  const validatorAddress = decodeURIComponent(awaitedParams.address);
  const validator = getSampleValidatorByAddress(validatorAddress);

  if (!validator) {
    notFound();
  }

  return (
    <Container type="boxed" className="space-y-6 xl:px-0">
      <ValidatorDetail validator={validator} />
    </Container>
  );
}
