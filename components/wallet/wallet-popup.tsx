"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useWallet } from "./wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { SendTransactionDialog } from "./send-transaction-dialog";
import { ReceiveDialog } from "./receive-dialog";
import { StakeDialog } from "./stake-dialog";
import { SwitchWalletDialog } from "./switch-wallet-dialog";
import { ActivityTab } from "./activity-tab";
import {
  Copy,
  LogOut,
  Settings,
  Repeat,
  Download,
  Send,
  Coins,
  ChevronRight,
  Wallet,
  Activity,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  formatBalanceWithCommas
} from "@/lib/utils/denomination";

export function WalletPopup() {
  const router = useRouter();
  const { isPopupOpen, closePopup, currentWallet, disconnectWallet, switchWallet, wallets, setShowCreateDialog } = useWallet();
  const { balance, transactions, fetchBalance, fetchTransactions } = useWalletStore();
  const [activeTab, setActiveTab] = useState("balances");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showSwitchWalletDialog, setShowSwitchWalletDialog] = useState(false);

  // Fetch balance and transactions when wallet is connected
  useEffect(() => {
    if (currentWallet && isPopupOpen) {
      fetchBalance(currentWallet.id);
      fetchTransactions(currentWallet.id);
    }
  }, [currentWallet, fetchBalance, fetchTransactions, isPopupOpen]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    const fullAddress = address.startsWith("0x") ? address : `0x${address}`;
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  };

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      toast.success("Address copied to clipboard");
    }
  };

  const handleDisconnect = () => {
    closePopup();
    router.push("/");
    setTimeout(() => {
      disconnectWallet();
    }, 100);
  };

  const handleViewAll = () => {
    closePopup();
    router.push("/wallet");
  };

  // Use real balance data
  const displayBalance = balance?.total || "0.00";
  const displayTokens = balance?.tokens || [];

  //TODO: Calculate total USD value
  const totalUSDValue = displayTokens.reduce((acc, token) => {
    const usdValue = parseFloat(token.usdValue?.replace(/[^0-9.-]+/g, "") || "0");
    return acc + usdValue;
  }, 0);

  // Determine actual transaction type (send vs receive)
  const recentTransactions = transactions.slice(0, 5).map((tx) => {
    // Normalize addresses for comparison (remove 0x prefix if present)
    const normalizeAddress = (addr?: string) => addr?.toLowerCase().replace(/^0x/, '') || '';
    const walletAddr = normalizeAddress(currentWallet?.address);
    const fromAddr = normalizeAddress(tx.from);
    const toAddr = normalizeAddress(tx.to);

    // Determine actual transaction direction
    let actualType = tx.type;
    if (tx.type === 'send') {
      // If wallet is the recipient, it's actually a receive
      if (walletAddr === toAddr && walletAddr !== fromAddr) {
        actualType = 'receive';
      }
      // If wallet is the sender, it remains send
      else if (walletAddr === fromAddr) {
        actualType = 'send';
      }
    }

    return {
      ...tx,
      actualType,
    };
  });

  return (
    <>
      <Sheet open={isPopupOpen} onOpenChange={closePopup}>
        <SheetContent side="left" className="w-full sm:max-w-[420px] p-0 flex flex-col bg-card gap-0 overflow-hidden">
          {currentWallet ? (
            <>
              {/* Header - Fixed */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-b border-border shrink-0">
                {/* Wallet Address & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1dd13a] flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-white">C</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-foreground truncate">
                        {formatAddress(currentWallet.address)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-muted shrink-0"
                        onClick={copyAddress}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-[#1dd13a]">Connected</div>
                      {wallets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs hover:bg-muted"
                          onClick={() => setShowSwitchWalletDialog(true)}
                        >
                          Switch
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Balance */}
                <div>
                  <button
                    onClick={handleViewAll}
                    className="flex items-center gap-1 text-sm text-muted-foreground mb-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Estimated Balance
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                    ${formatBalanceWithCommas(displayBalance)}
                  </h2>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                  >
                    <Repeat className="w-5 h-5" />
                    <span className="text-xs">Swap</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-xs">Buy</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                    onClick={() => setShowSendDialog(true)}
                  >
                    <Send className="w-5 h-5" />
                    <span className="text-xs">Send</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                    onClick={() => setShowStakeDialog(true)}
                  >
                    <Coins className="w-5 h-5" />
                    <span className="text-xs">Stake</span>
                  </Button>
                </div>
              </div>

              {/* Tabs - Scrollable */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className=" flex min-h-0">
                  <TabsList className="w-full justify-start bg-transparent p-0    rounded-none h-auto shrink-0">
                    <TabsTrigger
                      value="balances"
                      className="py-3  rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground"
                    >
                      Balances
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className="py-3 bg-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-muted-foreground data-[state=active]:text-foreground"
                    >
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  {/* Balances Tab */}
                  <TabsContent value="balances" className="flex-1 overflow-y-auto mt-0 p-0 data-[state=inactive]:hidden">
                    <div className="p-4 sm:p-6">
                      {displayTokens.length === 0 ? (
                        /* Empty State */
                        <Card className="p-8 sm:p-12 border-0">
                          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                            <div className="p-3 sm:p-4 bg-muted rounded-full">
                              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-base sm:text-lg font-semibold">No assets yet</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                                Start your blockchain journey by creating or investing in chains on the launchpad.
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                closePopup();
                                router.push("/");
                              }}
                              className="mt-2"
                            >
                              Go to Launchpad
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">TOP ASSETS</h3>
                            <Button
                              variant="link"
                              className="text-green-400 h-auto p-0 text-sm hover:text-green-400/80"
                              onClick={handleViewAll}
                            >
                              VIEW ALL
                            </Button>
                          </div>

                          {/* Assets List - Top 5 */}
                          <div className="space-y-3">
                            {displayTokens.slice(0, 5).map((token, index) => (
                              <button
                                key={index}
                                className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-primary">
                                      {token.name.slice(0, 1)}
                                    </span>
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium text-foreground">
                                      {token.name} <span className="text-muted-foreground">{token.symbol}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatBalanceWithCommas(token.balance)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-foreground">
                                    {token.usdValue || "$0.00"}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="flex-1 overflow-y-auto mt-0 p-0 data-[state=inactive]:hidden">
                    <div className="p-4 sm:p-6">
                      <ActivityTab
                        addresses={currentWallet ? [currentWallet.address] : []}
                        compact={true}
                        showSearchInput={false}
                        showDateFilter={false}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer - Fixed */}
              <div className="p-4 sm:p-5 border-t border-border space-y-2 sm:space-y-3 shrink-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 hover:bg-muted"
                  onClick={() => {
                    closePopup();
                    router.push("/settings");
                  }}
                >
                  <Settings className="w-5 h-5" />
                  <span>Wallet settings</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Disconnect wallet</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-muted-foreground">No wallet connected</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Send Transaction Dialog */}
      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />

      {/* Receive Dialog */}
      <ReceiveDialog
        open={showReceiveDialog}
        onOpenChange={setShowReceiveDialog}
      />

      {/* Stake Dialog */}
      <StakeDialog
        open={showStakeDialog}
        onOpenChange={setShowStakeDialog}
      />

      {/* Switch Wallet Dialog */}
      <SwitchWalletDialog
        open={showSwitchWalletDialog}
        onOpenChange={setShowSwitchWalletDialog}
        wallets={wallets}
        currentWallet={currentWallet}
        onSelectWallet={switchWallet}
        onCreateNew={() => setShowCreateDialog(true)}
      />
    </>
  );
}
