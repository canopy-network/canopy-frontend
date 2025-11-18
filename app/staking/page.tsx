"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  Coins,
  TrendingUp,
  Clock,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function StakingContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState("rewards");

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access staking features.
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
          <h1 className="text-3xl font-bold text-balance">Staking</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Stake your tokens to earn rewards and participate in network security.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Wallet Connected</CardTitle>
            <CardDescription>
              Connect your wallet to start staking and earning rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to view staking opportunities
              </p>
              <Button onClick={connectWallet} size="lg" className="gap-2">
                <Coins className="h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Staking</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Stake your tokens to earn rewards and participate in network security.
        </p>
      </div>

      <div className="space-y-6 max-w-[1200px]">
        {/* Total Interest Earned Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-muted-foreground">
                    Total interest earned to date
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Total rewards earned from all your staking positions.
                          APY varies by chain and validator.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-4xl font-bold">$0.00</p>
              </div>
              <Button variant="outline" disabled>
                View Earned Balances
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Staking Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="active">Active Stakes</TabsTrigger>
            <TabsTrigger value="unstaking">Unstaking Queue</TabsTrigger>
          </TabsList>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Staking Opportunities</CardTitle>
                <CardDescription>
                  Stake your tokens on different chains to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-2">No staking opportunities yet</p>
                  <p className="text-xs">
                    Staking will be available once chains are launched
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Stakes Tab */}
          <TabsContent value="active" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Active Stakes</CardTitle>
                <CardDescription>
                  Manage your current staking positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-2">No active stakes</p>
                  <p className="text-xs">
                    Your active staking positions will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unstaking Queue Tab */}
          <TabsContent value="unstaking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Unstaking Queue</CardTitle>
                <CardDescription>
                  Track your pending unstakes during the lockup period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-2">Unstaking queue is empty</p>
                  <p className="text-xs">
                    Pending unstakes will appear here during the lockup period
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-500">
                  Staking Coming Soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Staking functionality will be available once chains are launched
                  and validators are active. You'll be able to earn rewards by
                  securing the network.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StakingPage() {
  return <StakingContent />;
}
