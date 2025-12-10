import { Container } from "@/components/layout/container";
import { ValidatorDetailClient } from "@/components/validators/validator-detail-client";
import { notFound } from "next/navigation";
import { validatorsApi } from "@/lib/api";

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

  try {
    const validator = await validatorsApi.getValidator(validatorAddress);

    console.log("[ValidatorPage] validator", validator);
    return (
      <Container type="boxed" className="space-y-6 px-6 lg:px-10 mt-6">
        <ValidatorDetailClient validator={validator} />
      </Container>
    );
  } catch (error) {
    console.error("Failed to fetch validator:", error);
    notFound();
  }
}
