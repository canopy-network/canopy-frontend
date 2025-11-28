import { AccountHeaderDetails } from "@/components/address/account-header-details";
import { AccountDetails } from "@/components/address/account-details";
import { Container } from "@/components/layout/container";
import { Spacer } from "@/components/layout/spacer";
import { getExplorerAddress } from "@/lib/api/explorer";
import type { AddressResponse } from "@/types/addresses";
import type { Metadata } from "next";

/**
 * Convert CNPY from smallest unit (like wei) to standard units
 * CNPY uses 9 decimal places
 */
function cnpyToStandard(cnpy: number): number {
  return cnpy / 1_000_000_000;
}

/**
 * Fetch address information from the API and transform it to the expected format
 */
async function fetchAddressInformation(address: string) {
  const apiData = await getExplorerAddress(address, true, 10);

  if (!apiData) {
    return null;
  }

  const { summary } = apiData;

  // Convert portfolio value from smallest units to standard units
  const portfolioValue = cnpyToStandard(summary.total_portfolio_value_cnpy);
  const stakedValue = cnpyToStandard(summary.staked_balance_cnpy);
  const liquidValue = cnpyToStandard(summary.liquid_balance_cnpy);

  // Calculate staked percentage
  const totalValue = portfolioValue || 1; // Avoid division by zero
  const stakedPercentage = (stakedValue / totalValue) * 100;
  const freePercentage = (liquidValue / totalValue) * 100;

  return {
    address: apiData.address,
    createdAt: apiData.account_creation?.[0]
      ? new Date(apiData.account_creation[0])
      : new Date(Date.now() - 204 * 24 * 60 * 60 * 1000), // Default to 204 days ago if not available
    portfolioValue,
    change24h: {
      absolute: 0, // API doesn't provide 24h change data
      percentage: 0,
    },
    staked: {
      value: Math.round(stakedPercentage),
      free: Math.round(freePercentage),
    },
    // Include full API data for components that might need it
    apiData,
    cnpyTotal: apiData?.balances.reduce(
      (acc, balance) => acc + balance.balance,
      0
    ),
  };
}

interface AddressPageProps {
  params: Promise<{
    address: string;
  }>;
}

export async function generateMetadata(
  props: AddressPageProps
): Promise<Metadata> {
  try {
    const params = await props.params;
    const address = decodeURIComponent(params.address);

    // Fetch address data for metadata
    const apiData = await getExplorerAddress(address, false, 0);

    if (!apiData) {
      return {
        title: "Account Not Found | Canopy",
        description: "The requested account could not be found.",
      };
    }

    const title = `${address} | Account | Canopy`;

    // Create description from address summary
    const portfolioValue = apiData.summary.total_portfolio_value_fmt;
    const description = `View account details for ${address.slice(
      0,
      8
    )}...${address.slice(-6)}. Portfolio value: ${portfolioValue}. ${
      apiData.summary.is_validator ? "Validator account." : ""
    }`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "Canopy",
      },
      twitter: {
        card: "summary",
        title: `${address} | Account`,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Accounts | Canopy",
      description: "View account details on Canopy",
    };
  }
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
  apiData?: AddressResponse; // Full API response for components that need it
  cnpyTotal: number;
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
      <AccountDetails address={decodedAddress} apiData={addressInfo?.apiData} />

      <Spacer height={192} />
    </Container>
  );
}
