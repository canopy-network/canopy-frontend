import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useChainsStore } from "@/lib/stores/chains-store";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AssetsTab() {
  const router = useRouter();
  const { balance, availableAssets } = useWalletStore();
  const getChainById = useChainsStore((state) => state.getChainById);
  const [assetSearch, setAssetSearch] = useState("");
  const [sortBy, setSortBy] = useState("value");
  const [sortOrder, setSortOrder] = useState("desc");

  // Get total value from balance
  const totalValue = useMemo(() => {
    if (!balance?.total) return 0;
    return parseFloat(balance.total) || 0;
  }, [balance]);

  // Transform availableAssets to match the expected asset structure
  const assets = useMemo(() => {
    if (!availableAssets || availableAssets.length === 0) return [];

    return availableAssets.map((asset) => {
      const balanceNum = parseFloat(asset.balance) || 0;
      // Generate stable dummy price based on asset symbol hash
      const priceHash = asset.symbol.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const price = (Math.abs(priceHash) % 450) / 100 + 0.5; // Between 0.5 and 5.0
      // Generate stable dummy 24h change based on asset symbol hash
      const changeHash = asset.chainId.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const change24h = ((Math.abs(changeHash) % 200) / 10 - 10).toFixed(1); // Between -10% and +10%
      const value = balanceNum * price;

      // Get chain info for color - generate consistent color from symbol
      const chain = getChainById(asset.chainId);
      // Generate a consistent color based on symbol hash
      const hash = asset.symbol.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const color = `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;

      return {
        id: `${asset.chainId}-${asset.symbol}`,
        chainId: asset.chainId,
        symbol: asset.symbol,
        name: asset.name,
        balance: balanceNum,
        value: value,
        price: price,
        change24h: parseFloat(change24h),
        color: color,
      };
    });
  }, [availableAssets, getChainById]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase())
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let compareA: string | number, compareB: string | number;

    switch (sortBy) {
      case "name":
        compareA = a.name;
        compareB = b.name;
        break;
      case "value":
        compareA = a.value;
        compareB = b.value;
        break;
      case "price":
        compareA = a.price;
        compareB = b.price;
        break;
      case "change24h":
        compareA = a.change24h;
        compareB = b.change24h;
        break;
      default:
        compareA = a.value;
        compareB = b.value;
    }

    if (sortOrder === "asc") {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  const [selectedPeriod, setSelectedPeriod] = useState("1D");

  // Generate dummy portfolio value history data
  const getPortfolioChartData = () => {
    const baseValue = totalValue || 17055.22; // Use dummy base value if no balance
    const variation = baseValue * 0.1;

    switch (selectedPeriod) {
      case "1H":
        return Array.from({ length: 12 }, (_, i) => ({
          time: `${Math.floor((i * 5) / 60)}:${((i * 5) % 60)
            .toString()
            .padStart(2, "0")}`,
          value: baseValue + (Math.random() - 0.5) * variation,
        }));
      case "1D":
        return Array.from({ length: 12 }, (_, i) => ({
          time: `${i * 2}:00`,
          value: baseValue + (Math.random() - 0.5) * variation,
        }));
      case "1W": {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map((day) => ({
          time: day,
          value: baseValue + (Math.random() - 0.5) * variation,
        }));
      }
      case "1M":
        return Array.from({ length: 10 }, (_, i) => ({
          time: `${i * 3 + 1}`,
          value: baseValue + (Math.random() - 0.5) * variation,
        }));
      case "1Y": {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months.map((month) => ({
          time: month,
          value: baseValue + (Math.random() - 0.5) * variation,
        }));
      }
      default:
        return [];
    }
  };

  const portfolioChartData = getPortfolioChartData();

  return (
    <div className="space-y-6">
      {/* Portfolio Value Chart */}
      <Card className="p-1">
        <div className="space-y-2">
          {/* Estimated Balance Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">Estimated Balance</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-bold">
                  $
                  {totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ≈ ${totalValue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Today&apos;s PnL
                </span>
                <span
                  className={`text-sm ${
                    totalValue * 0.001 >= 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  -${(totalValue * 0.001).toFixed(2)}(0.10%)
                </span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <Card className="relative h-[272px] bg-muted/40">
            {/* Time Period Buttons */}
            <div className="absolute right-4 top-2.5 z-10 flex gap-0.5 p-0.5 bg-muted/50 rounded-lg">
              <Button
                variant={selectedPeriod === "1H" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setSelectedPeriod("1H")}
              >
                1H
              </Button>
              <Button
                variant={selectedPeriod === "1D" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setSelectedPeriod("1D")}
              >
                1D
              </Button>
              <Button
                variant={selectedPeriod === "1W" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setSelectedPeriod("1W")}
              >
                1W
              </Button>
              <Button
                variant={selectedPeriod === "1M" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setSelectedPeriod("1M")}
              >
                1M
              </Button>
              <Button
                variant={selectedPeriod === "1Y" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setSelectedPeriod("1Y")}
              >
                1Y
              </Button>
            </div>

            {/* Chart */}
            <div className="h-full pt-12 px-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioChartData}>
                  <defs>
                    <linearGradient
                      id="portfolioGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    fill="url(#portfolioGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={assetSearch}
          onChange={(e) => setAssetSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Asset List Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Chain
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center justify-end gap-2">
                  Amount
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort("change24h")}
              >
                <div className="flex items-center justify-end gap-2">
                  24H Change
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end gap-2">
                  Price
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssets.length > 0 ? (
              sortedAssets.map((asset) => {
                // Generate dummy 24h change chart data
                const miniChartData = Array.from({ length: 20 }, () => {
                  const basePrice = asset.price;
                  const variation = basePrice * 0.05;
                  return {
                    price: basePrice + (Math.random() - 0.5) * variation,
                  };
                });

                const chain = getChainById(asset.chainId);
                const handleClick = () => {
                  if (chain) {
                    router.push(`/chains/${chain.id}`);
                  }
                };

                return (
                  <TableRow
                    key={asset.id}
                    onClick={handleClick}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: asset.color }}
                        >
                          <span className="text-xs font-bold text-white">
                            {asset.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        $
                        {asset.value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {asset.balance.toLocaleString()} {asset.symbol}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {miniChartData.length > 0 && (
                          <div className="w-12 h-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={miniChartData}>
                                <Line
                                  type="monotone"
                                  dataKey="price"
                                  stroke={
                                    asset.change24h >= 0 ? "#10b981" : "#ef4444"
                                  }
                                  strokeWidth={1.5}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        <div
                          className={`font-medium ${
                            asset.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {asset.change24h >= 0 ? "+" : ""}
                          {asset.change24h}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        ${asset.price.toFixed(4)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-muted rounded-full mb-4">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      No assets found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try searching with a different asset name or symbol
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
