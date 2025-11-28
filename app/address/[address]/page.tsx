import { AccountHeaderDetails } from "@/components/address/account-header-details";
import { AccountDetails } from "@/components/address/account-details";
import { Container } from "@/components/layout/container";
import { Spacer } from "@/components/layout/spacer";
// Placeholder function - will be replaced with actual API call
async function fetchAddressInformation(address: string) {
  // TODO: Replace with actual API call
  return {
    address,
    createdAt: new Date(Date.now() - 204 * 24 * 60 * 60 * 1000), // 204 days ago
    portfolioValue: 43567.32,
    change24h: {
      absolute: 198.23,
      percentage: 5.6,
    },
    staked: {
      value: 44,
      free: 36,
    },
  };
}

interface AddressPageProps {
  params: Promise<{
    address: string;
  }>;
}

interface AddressInfo {
  address: string;
  createdAt: Date;
  portfolioValue: number;
  change24h: {
    absolute: number;
    percentage: number;
  };
  staked: {
    value: number;
    free: number;
  };
}

export default async function AddressPage({ params }: AddressPageProps) {
  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);

  let addressInfo: AddressInfo | null = null;

  try {
    addressInfo = await fetchAddressInformation(decodedAddress);
  } catch (error) {
    console.error("Failed to fetch address information:", error);
    // Continue with null data - component will handle fallback
  }

  return (
    <Container type="boxed" className="space-y-6">
      <AccountHeaderDetails
        addressInfo={addressInfo}
        address={decodedAddress}
      />
      <AccountDetails address={decodedAddress} />

      <Spacer height={192} />
    </Container>
  );
}
