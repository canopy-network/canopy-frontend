"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Share2,
  ExternalLink,
  Copy,
  TrendingUp,
  ArrowUpDown,
  Activity,
  Users,
  Wallet,
  Droplets,
} from "lucide-react";
import tokens from "@/data/tokens.json";
import { useWallet } from "@/components/wallet/wallet-provider";

import TradingModule from "@/components/trading/trading-module";

// CNPY Logo component
function CnpyLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1dd13a 0%, #0fa32c 100%)",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        C
      </span>
    </div>
  );
}

// Token Avatar component
function TokenAvatar({
  symbol,
  color,
  size = 32,
}: {
  symbol: string;
  color?: string;
  size?: number;
}) {
  if (symbol === "CNPY") {
    return <CnpyLogo size={size} />;
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color || "#6b7280",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
}

// Mock transactions data
const mockTransactions = [
  {
    time: "12s",
    type: "Buy",
    usd: 4294.86,
    tokenA: 1.51942,
    tokenB: 4299.83,
    wallet: "0x9e64...055F",
  },
  {
    time: "12s",
    type: "Buy",
    usd: 2391.96,
    tokenA: 0.84622,
    tokenB: 2394.82,
    wallet: "0x9e64...055F",
  },
  {
    time: "12s",
    type: "Sell",
    usd: 1058.44,
    tokenA: 0.37445,
    tokenB: 1059.73,
    wallet: "0x9e64...055F",
  },
  {
    time: "15s",
    type: "Buy",
    usd: 1416.24,
    tokenA: 0.50103,
    tokenB: 1418.0,
    wallet: "0x9e64...055F",
  },
  {
    time: "18s",
    type: "Sell",
    usd: 998.72,
    tokenA: 0.35332,
    tokenB: 999.9,
    wallet: "0xA170...1834",
  },
  {
    time: "22s",
    type: "Buy",
    usd: 998.65,
    tokenA: 0.3533,
    tokenB: 999.9,
    wallet: "0xEadf...57BC",
  },
  {
    time: "25s",
    type: "Buy",
    usd: 1550.77,
    tokenA: 0.54863,
    tokenB: 1552.68,
    wallet: "0x9e64...055F",
  },
];

// Mock holders data
const mockHolders = [
  { address: "0x9e64...055F", balance: 125000, value: 12500, share: 15.2 },
  { address: "0xA170...1834", balance: 98000, value: 9800, share: 11.9 },
  { address: "0xEadf...57BC", balance: 75000, value: 7500, share: 9.1 },
  { address: "0x7f3B...4a21", balance: 62000, value: 6200, share: 7.5 },
  { address: "0x2c8E...9d0F", balance: 45000, value: 4500, share: 5.5 },
];

interface PoolDetailClientProps {
  pool: {
    id: string;
    tokenA: string;
    tokenB: string;
    totalLiquidity: number;
    volume24h: number;
    fees24h: number;
    apr: number;
    tokenAReserve?: number;
    tokenBReserve?: number;
  };
  tokens: Array<{
    symbol: string;
    name: string;
    brandColor: string;
  }>;
  lpPositions?: Array<{
    id: string;
    poolId: string;
    tokenA: string;
    tokenB: string;
    lpTokens: number;
    tokenAAmount: number;
    tokenBAmount: number;
    valueUSD: number;
    earnings: number;
    share?: number;
  }>;
}

export default function PoolDetailClient({
  pool,
  lpPositions = [],
}: PoolDetailClientProps) {
  const router = useRouter();
  const [chartTimeframe, setChartTimeframe] = useState("1D");
  const [activeTab, setActiveTab] = useState("overview");
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const { currentWallet, isConnecting } = useWallet();

  // Get token data
  const tokenBData = tokens.find((t) => t.symbol === pool.tokenB);

  // Get user's position for this pool
  const userPosition = useMemo(() => {
    if (!currentWallet || !lpPositions) return null;
    return lpPositions.find((pos) => pos.poolId === pool.id);
  }, [currentWallet, lpPositions, pool.id]);

  // Calculate stats
  const tvl = pool.totalLiquidity || 0;
  const volume24h = pool.volume24h || 0;
  const fees24h = pool.fees24h || 0;
  const apr = pool.apr || 0;

  // Mock pool balances
  const tokenABalance = pool.tokenAReserve || 20300;
  const tokenBBalance = pool.tokenBReserve || 13400000;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  if (isConnecting) {
    return <div>Connecting...</div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Top Bar - Breadcrumb */}
      <div className="px-6 py-3 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => router.push("/liquidity")}
              className="hover:text-foreground"
            >
              Liquidity
            </button>
            <span>/</span>
            <span className="text-foreground">
              {tokenBData?.name || pool.tokenB}
            </span>
            <Badge
              variant="outline"
              className="border-green-500/50 text-green-500 ml-2"
            >
              {apr.toFixed(1)}% APY
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pool Header Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <TokenAvatar
                    symbol={pool.tokenB}
                    color={tokenBData?.brandColor}
                    size={56}
                  />
                  <div>
                    <h1 className="text-2xl font-bold">
                      {tokenBData?.name || pool.tokenB}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{pool.tokenB}</Badge>
                      <span className="text-sm text-muted-foreground">
                        / CNPY
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(tvl)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Value Locked
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">
                    24h Volume
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatCurrency(volume24h)}
                    </span>
                    <span className="text-green-500 text-xs flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      41%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">
                    24h Fees
                  </div>
                  <div className="font-semibold">{formatCurrency(fees24h)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">APY</div>
                  <div className="font-semibold text-green-500">
                    {apr.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">
                    Holders
                  </div>
                  <div className="font-semibold">1,247</div>
                </div>
              </div>
            </Card>

            {/* Volume Chart */}
            {
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(volume24h)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {["1H", "1D", "1W", "1M", "1Y"].map((tf) => (
                      <Button
                        key={tf}
                        variant={chartTimeframe === tf ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => setChartTimeframe(tf)}
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>

                {console.log({ chartTimeframe })}
                {/* <LiquidityChart timeframe={chartTimeframe} height={160} /> */}
              </Card>
            }

            {/* Tabs Section */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="holders" className="gap-2">
                  <Users className="w-4 h-4" />
                  Holders
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Pool Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Time</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <ArrowUpDown className="w-3 h-3" />
                            Type
                          </div>
                        </TableHead>
                        <TableHead className="text-right">USD</TableHead>
                        <TableHead className="text-right">
                          {pool.tokenA}
                        </TableHead>
                        <TableHead className="text-right">
                          {pool.tokenB}
                        </TableHead>
                        <TableHead className="text-right">Wallet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-muted-foreground">
                            {tx.time}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                tx.type === "Buy"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            $
                            {tx.usd.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.tokenA.toFixed(5)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.tokenB.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-muted-foreground font-mono text-xs">
                              {tx.wallet}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="holders" className="mt-4">
                <Card className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockHolders.map((holder, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {holder.address}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(holder.balance)} {pool.tokenB}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(holder.value)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${holder.share}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground text-sm w-12">
                                {holder.share}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <Card className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Pool Composition
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CnpyLogo size={24} />
                          <span>CNPY</span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">
                            {formatNumber(tokenABalance)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            50%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TokenAvatar
                            symbol={pool.tokenB}
                            color={tokenBData?.brandColor}
                            size={24}
                          />
                          <span>{pool.tokenB}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">
                            {formatNumber(tokenBBalance)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            50%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Contract Addresses
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pool Contract</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            0xC696...E8D0
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{pool.tokenB} Token</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            0xaf88...5831
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <TradingModule variant="liquidity" />
            {/* Add Liquidity Card - Placeholder for Trading Module */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Liquidity</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Provide liquidity to this pool to earn trading fees
              </p>
              <Button
                className="w-full"
                onClick={() => setAddLiquidityOpen(true)}
              >
                Add Liquidity
              </Button>
            </Card>

            {/* Your Position Card */}
            <Card className="p-4">
              <div className="text-sm font-medium mb-3">Your Position</div>

              {/* Not connected state */}
              {!currentWallet && (
                <div className="text-center py-6 text-muted-foreground">
                  <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Connect wallet to view your position
                  </p>
                </div>
              )}

              {/* Connected but no position - empty state */}
              {currentWallet && !userPosition && (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    No position in this pool
                  </p>
                  <p className="text-xs">
                    Add liquidity above to start earning fees
                  </p>
                </div>
              )}

              {/* Connected with position */}
              {currentWallet && userPosition && (
                <div className="space-y-4">
                  {/* Value & Earnings Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Value</div>
                      <div className="text-xl font-bold">
                        $
                        {userPosition.valueUSD.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Earned
                      </div>
                      <div className="text-xl font-bold text-green-500">
                        +${userPosition.earnings.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Token Amounts */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TokenAvatar symbol={pool.tokenA} size={20} />
                        <span className="text-muted-foreground">
                          {pool.tokenA}
                        </span>
                      </div>
                      <span className="font-medium">
                        {userPosition.tokenAAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TokenAvatar
                          symbol={pool.tokenB}
                          color={tokenBData?.brandColor}
                          size={20}
                        />
                        <span className="text-muted-foreground">
                          {pool.tokenB}
                        </span>
                      </div>
                      <span className="font-medium">
                        {userPosition.tokenBAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Pool Share */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Pool share</span>
                    <span className="font-medium">
                      {(userPosition.share || 0).toFixed(2)}%
                    </span>
                  </div>

                  {/* Withdraw Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setWithdrawDialogOpen(true)}
                  >
                    Withdraw $
                    {userPosition.valueUSD.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {/* <AddLiquidityDialog
        open={addLiquidityOpen}
        onOpenChange={setAddLiquidityOpen}
        selectedPool={pool as unknown as null}
        availablePools={[pool] as unknown as never[]}
      />

      <WithdrawLiquidityDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        position={userPosition || null}
        onWithdrawSuccess={() => {}}
      /> */}
    </div>
  );
}
