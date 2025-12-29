"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { WalletHeader } from "@/components/wallet/wallet-header";
import AssetsTab from "@/components/wallet/assets-tab";
import { ActivityTab } from "@/components/wallet/activity-tab";
import { StakingTab } from "@/components/wallet/staking-tab";
import { GovernanceTab } from "@/components/wallet/governance-tab";
import { useStaking } from "@/lib/hooks/use-staking";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import OrderBookTab from "@/components/orderbook/orders-tab";

function WalletContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet, setShowSelectDialog } = useWallet();
  const { balance, transactions, fetchBalance, fetchTransactions, fetchPortfolioOverview } = useWalletStore();
  const { positions } = useStaking(currentWallet?.address);

  const [activeTab, setActiveTab] = useState("orders");

  // Memoize addresses array to prevent recreation on every render
  // This is critical to prevent infinite loops in child components
  const addresses = useMemo(() => (currentWallet ? [currentWallet.address] : []), [currentWallet?.address]);

  // Fetch data when wallet changes
  useEffect(() => {
    if (currentWallet) {
      fetchBalance(currentWallet.id);
      fetchTransactions(currentWallet.id);
      fetchPortfolioOverview([currentWallet.address]);
    }
  }, [currentWallet?.id, currentWallet?.address, fetchBalance, fetchTransactions, fetchPortfolioOverview]);

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      toast.success("Address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    const fullAddress = address.startsWith("0x") ? address : `0x${address}`;
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  };

  const handleDisconnect = () => {
    router.push("/");
    setTimeout(() => {
      // Disconnect logic handled by wallet provider
    }, 100);
  };

  // Use real balance data from the store, fallback to defaults
  const displayBalance = balance?.total || "0.00";
  const displayTokens = balance?.tokens || [];

  // Debug logging
  console.log("Wallet page - balance:", balance);
  console.log("Wallet page - displayTokens:", displayTokens);

  // Calculate total USD value from tokens
  const totalUSDValue = displayTokens.reduce((acc, token) => {
    const usdValue = parseFloat(token.usdValue?.replace(/[^0-9.-]+/g, "") || "0");
    return acc + usdValue;
  }, 0);

  const displayUSDValue = `$${totalUSDValue.toFixed(2)}`;
  const displayTransactions = transactions.length > 0 ? transactions : [];
  const disallowChainIds = positions.filter((p) => p.status !== "unstaking").map((p) => p.chain_id);

  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWallet) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Wallet</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Connect your wallet to manage assets and view transactions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Wallet Connected</CardTitle>
            <CardDescription>Connect your wallet to view account details and manage your assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Get started by connecting or creating a wallet</p>
              <Button onClick={connectWallet} size="lg" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Container type="boxed-small" className="flex flex-row gap-6">
      <div className="flex flex-col gap-6 w-full">
        {/* Main Content */}
        <WalletHeader />

        {/* Tabs */}
        <div className="space-y-4 sm:space-y-6">
          {/* Tabs for Assets, Activity, Staking, Governance */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList variant="wallet">
              <TabsTrigger value="orders" variant="wallet">
                Order Book
              </TabsTrigger>
              <TabsTrigger value="assets" variant="wallet">
                Assets
              </TabsTrigger>
              <TabsTrigger value="staking" variant="wallet">
                Staking
              </TabsTrigger>
              <TabsTrigger value="activity" variant="wallet">
                Activity
              </TabsTrigger>
              <TabsTrigger value="governance" variant="wallet">
                Governance
              </TabsTrigger>
            </TabsList>

            {/* Assets Tab */}
            <TabsContent value="orders" className="mt-4 sm:mt-6">
              <OrderBookTab />
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="mt-4 sm:mt-6">
              <AssetsTab />
            </TabsContent>

            {/* Staking Tab */}
            <TabsContent value="staking" className="mt-4 sm:mt-6">
              <StakingTab addresses={addresses} />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4 sm:mt-6">
              <ActivityTab addresses={addresses} compact />
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance" className="mt-4 sm:mt-6">
              <GovernanceTab tokens={displayTokens} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
