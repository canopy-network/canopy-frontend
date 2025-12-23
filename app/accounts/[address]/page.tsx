import { AddressDetails } from "@/components/explorer/address-details";
import { Container } from "@/components/layout/container";
import { notFound } from "next/navigation";
import { getExplorerAddress } from "@/lib/api/explorer";
import type { Metadata } from "next";

// Force dynamic rendering to ensure params are always fresh
export const dynamic = "force-dynamic";
export const dynamicParams = true;

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

    // Validate address format (40 character hex string)
    if (!address || address.length !== 40 || !/^[0-9a-fA-F]+$/.test(address)) {
      return {
        title: "Address Not Found | Canopy",
        description: "The requested address could not be found.",
      };
    }

    // Try to fetch address data for more detailed metadata
    try {
      const addressData = await getExplorerAddress(address, false, 0);

      if (!addressData) {
        return {
          title: `${address.slice(0, 8)}... | Accounts | Canopy`,
          description: `View account details for address ${address.slice(0, 8)}...`,
        };
      }

      const summary = addressData.summary;
      const title = `${address.slice(0, 8)}... | Accounts | Canopy`;
      const description = `Account ${address.slice(0, 8)}... - Portfolio: ${summary.total_portfolio_value_fmt}, Chains: ${summary.chain_count}${summary.is_validator ? ", Validator" : ""}`;

      return {
        title,
        description,
        openGraph: {
          title: `Account ${address.slice(0, 8)}...`,
          description,
          type: "website",
          siteName: "Canopy",
        },
        twitter: {
          card: "summary",
          title: `Account ${address.slice(0, 8)}...`,
          description,
        },
      };
    } catch (error) {
      // If address fetch fails, still provide basic metadata
      console.error("Error fetching address for metadata:", error);
      const title = `${address.slice(0, 8)}... | Accounts | Canopy`;
      return {
        title,
        description: `View account details for address ${address.slice(0, 8)}... on Canopy`,
        openGraph: {
          title: `Account ${address.slice(0, 8)}...`,
          description: `View account details for address ${address.slice(0, 8)}... on Canopy`,
          type: "website",
          siteName: "Canopy",
        },
        twitter: {
          card: "summary",
          title: `Account ${address.slice(0, 8)}...`,
          description: `View account details for address ${address.slice(0, 8)}... on Canopy`,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Accounts | Canopy",
      description: "View account details on Canopy",
    };
  }
}

export default async function AddressPage(props: AddressPageProps) {
  const params = await props.params;
  const address = decodeURIComponent(params.address);

  // Validate address format (40 character hex string)
  if (!address || address.length !== 40 || !/^[0-9a-fA-F]+$/.test(address)) {
    notFound();
  }

  return (
    <Container type="boxed" className="space-y-6 xl:px-0">
      <AddressDetails address={address} />
    </Container>
  );
}

