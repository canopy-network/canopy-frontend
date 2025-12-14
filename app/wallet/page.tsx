"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { WalletHeader } from "@/components/wallet/wallet-header";
import AssetsTab from "@/components/wallet/assets-tab";
import { ActivityTab } from "@/components/wallet/activity-tab";
import { StakingTab } from "@/components/wallet/staking-tab";
import { GovernanceTab } from "@/components/wallet/governance-tab";
import { Send, Download, Coins, Repeat, Wallet, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/container";

function WalletContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet, setShowSelectDialog } = useWallet();
  const {
    balance,
    transactions,
    fetchBalance,
    fetchTransactions,
    fetchPortfolioOverview,
    openSendDialog,
    openReceiveDialog,
    openStakeDialog,
  } = useWalletStore();

  const [showQuickActionsSheet, setShowQuickActionsSheet] = useState(false);
  const [activeTab, setActiveTab] = useState("assets");

  // Fetch data when wallet changes
  useEffect(() => {
    if (currentWallet) {
      fetchBalance(currentWallet.id);
      fetchTransactions(currentWallet.id);
      fetchPortfolioOverview([currentWallet.address]);
    }
  }, [currentWallet]);

  // Use real balance data from the store, fallback to defaults
  const displayBalance = balance?.total || "0.00";
  const displayTokens = balance?.tokens || [];

  // Debug logging
  console.log("Wallet page - balance:", balance);
  console.log("Wallet page - displayTokens:", displayTokens);

  // Calculate total USD value from tokens
  const totalUSDValue = displayTokens.reduce((acc, token) => {
    const usdValue = parseFloat(
      token.usdValue?.replace(/[^0-9.-]+/g, "") || "0"
    );
    return acc + usdValue;
  }, 0);

  const displayUSDValue = `$${totalUSDValue.toFixed(2)}`;
  const displayTransactions = transactions.length > 0 ? transactions : [];

  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your wallet.
            </CardDescription>
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
            <CardDescription>
              Connect your wallet to view account details and manage your
              assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by connecting or creating a wallet
              </p>
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
    <Container type="boxed" className="flex flex-row">
      <div className="flex flex-col gap-6">
        {/* Main Content */}
        <WalletHeader />

        {/* Tabs */}
        <div className="space-y-4 sm:space-y-6">
          {/* Tabs for Assets, Activity, Staking, Governance */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList variant="wallet">
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
            <TabsContent value="assets" className="mt-4 sm:mt-6">
              <AssetsTab />
            </TabsContent>

            {/* Staking Tab */}
            <TabsContent value="staking" className="mt-4 sm:mt-6">
              <StakingTab
                addresses={currentWallet ? [currentWallet.address] : []}
              />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4 sm:mt-6">
              <ActivityTab
                addresses={currentWallet ? [currentWallet.address] : []}
                compact
              />
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance" className="mt-4 sm:mt-6">
              <GovernanceTab tokens={displayTokens} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Quick Actions Sidebar - Desktop */}
      <div className="hidden lg:block lg:order-2">
        <Card className="w-64 shrink-0 h-fit sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={openSendDialog}
              >
                <Send className="h-5 w-5" />
                <span className="text-xs">Send</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={openReceiveDialog}
              >
                <Download className="h-5 w-5" />
                <span className="text-xs">Buy</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => toast.info("Swap coming soon")}
              >
                <Repeat className="h-5 w-5" />
                <span className="text-xs">Swap</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={openStakeDialog}
              >
                <Coins className="h-5 w-5" />
                <span className="text-xs">Stake</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Button - Mobile */}
      <div className="lg:hidden w-full order-1 lg:order-2">
        <Sheet
          open={showQuickActionsSheet}
          onOpenChange={setShowQuickActionsSheet}
        >
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-12">
              <span className="text-sm font-medium">Quick Actions</span>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto p-0">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>Quick Actions</SheetTitle>
            </SheetHeader>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => {
                    openSendDialog();
                    setShowQuickActionsSheet(false);
                  }}
                >
                  <Send className="h-5 w-5" />
                  <span className="text-xs">Send</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => {
                    openReceiveDialog();
                    setShowQuickActionsSheet(false);
                  }}
                >
                  <Download className="h-5 w-5" />
                  <span className="text-xs">Buy</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => {
                    toast.info("Swap coming soon");
                    setShowQuickActionsSheet(false);
                  }}
                >
                  <Repeat className="h-5 w-5" />
                  <span className="text-xs">Swap</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => {
                    openStakeDialog();
                    setShowQuickActionsSheet(false);
                  }}
                >
                  <Coins className="h-5 w-5" />
                  <span className="text-xs">Stake</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Container>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
