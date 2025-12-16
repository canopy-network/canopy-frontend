"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent, CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { SendTransactionDialog } from "@/components/wallet/send-transaction-dialog";
import { ReceiveDialog } from "@/components/wallet/receive-dialog";
import { StakeDialog } from "@/components/wallet/stake-dialog";
import { AssetsTab } from "@/components/wallet/assets-tab";
import { ActivityTab } from "@/components/wallet/activity-tab";
import { StakingTab } from "@/components/wallet/staking-tab";
import { GovernanceTab } from "@/components/wallet/governance-tab";
import { RewardsActivity } from "@/components/wallet/rewards-activity";
import { useStaking } from "@/lib/hooks/use-staking";
import {
  Copy,
  Send,
  Download,
  Coins,
  Settings,
  Repeat,
  LogOut, Wallet,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

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
  } = useWalletStore();
  const { positions } = useStaking(currentWallet?.address);

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
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
  const disallowChainIds = positions
    .filter((p) => p.status !== "unstaking")
    .map((p) => p.chain_id);

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
    <div>
      <div className="flex-1 p-4 sm:p-6 pt-4">
        <div className="max-w-[1024px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            {/* Header with wallet info */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1dd13a] flex items-center justify-center shrink-0">
                    <span className="text-base sm:text-lg font-bold text-white">C</span>
                  </div>

                  {/* Wallet Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {formatAddress(currentWallet.address)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 hover:bg-muted"
                        onClick={copyAddress}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-xs sm:text-sm text-[#1dd13a]">Connected</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-4 sm:space-y-6">

              {/* Tabs for Assets, Activity, Staking, Governance */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="h-auto w-full justify-start bg-transparent p-0 border-b rounded-none overflow-x-auto scrollbar-hide">
                  <TabsTrigger
                    value="assets"
                    className="py-3 sm:py-4 px-0 mr-4 sm:mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-sm sm:text-base shrink-0"
                  >
                    Assets
                  </TabsTrigger>
                  <TabsTrigger
                    value="staking"
                    className="py-3 sm:py-4 px-0 mr-4 sm:mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-sm sm:text-base shrink-0"
                  >
                    Staking
                  </TabsTrigger>
                  <TabsTrigger
                    value="rewards"
                    className="py-3 sm:py-4 px-0 mr-4 sm:mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-sm sm:text-base shrink-0"
                  >
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="py-3 sm:py-4 px-0 mr-4 sm:mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-sm sm:text-base shrink-0"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="governance"
                    className="py-3 sm:py-4 px-0 mr-4 sm:mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-sm sm:text-base shrink-0"
                  >
                    Governance
                  </TabsTrigger>
                </TabsList>

                {/* Assets Tab */}
                <TabsContent value="assets" className="mt-4 sm:mt-6">
                  <AssetsTab
                    addresses={currentWallet ? [currentWallet.address] : []}
                  />
                </TabsContent>

                {/* Staking Tab */}
                <TabsContent value="staking" className="mt-4 sm:mt-6">
                  <StakingTab addresses={currentWallet ? [currentWallet.address] : []} />
                </TabsContent>

                {/* Rewards Tab */}
                <TabsContent value="rewards" className="mt-4 sm:mt-6">
                  <RewardsActivity
                    addresses={currentWallet ? [currentWallet.address] : []}
                    limit={10}
                  />
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4 sm:mt-6">
                  <ActivityTab addresses={currentWallet ? [currentWallet.address] : []} compact />
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
                    onClick={() => setShowSendDialog(true)}
                  >
                    <Send className="h-5 w-5" />
                    <span className="text-xs">Send</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setShowReceiveDialog(true)}
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
        onClick={() => setShowStakeDialog(true)}
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
            <Sheet open={showQuickActionsSheet} onOpenChange={setShowQuickActionsSheet}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12"
                >
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
                        setShowSendDialog(true);
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
                        setShowReceiveDialog(true);
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
                        setShowStakeDialog(true);
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
        </div>
      </div>

      {/* Dialogs */}
      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />
      <ReceiveDialog
        open={showReceiveDialog}
        onOpenChange={setShowReceiveDialog}
      />
      <StakeDialog
        open={showStakeDialog}
        onOpenChange={setShowStakeDialog}
        disallowChainIds={disallowChainIds}
      />
    </div>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
