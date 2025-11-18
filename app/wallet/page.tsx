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
import { useWallet } from "@/components/wallet/wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { SendTransactionDialog } from "@/components/wallet/send-transaction-dialog";
import { ReceiveDialog } from "@/components/wallet/receive-dialog";
import { AssetsTab } from "@/components/wallet/assets-tab";
import { ActivityTab } from "@/components/wallet/activity-tab";
import {
  Copy,
  Send,
  Download,
  Coins,
  Settings,
  Repeat,
  LogOut, Wallet,
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

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
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

  if (!isAuthenticated) {
    return (
      <div className="p-8">
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
      <div className="p-8">
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
            <div className="flex-1 p-6 pt-4">
                <div className="max-w-[1024px] mx-auto flex gap-12">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header with wallet info */}
                        <div className="mb-8">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-[#1dd13a] flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg font-bold text-white">C</span>
                                    </div>

                                    {/* Wallet Info */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-base font-semibold text-foreground">
                                                {formatAddress(currentWallet.address)}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 hover:bg-muted"
                                                onClick={copyAddress}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="text-sm text-[#1dd13a]">Connected</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full hover:bg-muted"
                                        onClick={() => router.push("/settings")}
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={handleDisconnect}
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="space-y-6">

                            {/* Tabs for Assets, Activity, Staking, Governance */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="h-auto w-full justify-start bg-transparent p-0 border-b rounded-none">
                                    <TabsTrigger
                                        value="assets"
                                        className="py-4 px-0 mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent"
                                    >
                                        Assets
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="staking"
                                        className="py-4 px-0 mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent"
                                        disabled
                                    >
                                        Staking
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="activity"
                                        className="py-4 px-0 mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent"
                                    >
                                        Activity
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="governance"
                                        className="py-4 px-0 mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent"
                                        disabled
                                    >
                                        Governance
                                    </TabsTrigger>
                                </TabsList>

                                {/* Assets Tab */}
                                <TabsContent value="assets" className="mt-6">
                                    <AssetsTab
                                        tokens={displayTokens}
                                        totalBalance={displayBalance}
                                        totalUSDValue={displayUSDValue}
                                    />
                                </TabsContent>

                                {/* Staking Tab - Placeholder */}
                                <TabsContent value="staking" className="mt-6">
                                    <Card>
                                        <CardContent className="text-center py-12 text-muted-foreground">
                                            <Coins className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                            <p className="text-sm">Staking coming soon</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Activity Tab */}
                                <TabsContent value="activity" className="mt-6">
                                    <ActivityTab transactions={displayTransactions} compact/>
                                </TabsContent>

                                {/* Governance Tab - Placeholder */}
                                <TabsContent value="governance" className="mt-6">
                                    <Card>
                                        <CardContent className="text-center py-12 text-muted-foreground">
                                            <Coins className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                            <p className="text-sm">Governance coming soon</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Quick Actions Sidebar */}
                    <Card className="w-64 shrink-0 h-fit sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    onClick={() => setShowSendDialog(true)}
                                >
                                    <Send className="h-5 w-5"/>
                                    <span className="text-xs">Send</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    disabled
                                >
                                    <Download className="h-5 w-5"/>
                                    <span className="text-xs">Buy</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    disabled
                                >
                                    <Repeat className="h-5 w-5"/>
                                    <span className="text-xs">Swap</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    disabled
                                >
                                    <Coins className="h-5 w-5"/>
                                    <span className="text-xs">Stake</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
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
        </div>
    );
}

export default function WalletPage() {
  return <WalletContent />;
}
