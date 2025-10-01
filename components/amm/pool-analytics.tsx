"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Droplets, DollarSign, Users } from "lucide-react"

const tvlData = [
  { time: "Jan", tvl: 8.2, volume: 2.1 },
  { time: "Feb", tvl: 9.1, volume: 2.4 },
  { time: "Mar", tvl: 10.5, volume: 2.8 },
  { time: "Apr", tvl: 11.2, volume: 3.1 },
  { time: "May", tvl: 11.8, volume: 2.9 },
  { time: "Jun", tvl: 12.4, volume: 3.4 },
]

const poolDistribution = [
  { name: "CNPY/USDC", value: 35, amount: "$12.6M", color: "hsl(var(--primary))" },
  { name: "CNPY/ETH", value: 25, amount: "$8.1M", color: "hsl(var(--chart-2))" },
  { name: "CNPY/SUPPLY", value: 20, amount: "$5.4M", color: "hsl(var(--chart-3))" },
  { name: "CNPY/DEFI", value: 15, amount: "$4.2M", color: "hsl(var(--chart-4))" },
  { name: "CNPY/GAME", value: 5, amount: "$2.8M", color: "hsl(var(--chart-5))" },
]

const feeData = [
  { day: "Mon", fees: 8500 },
  { day: "Tue", fees: 9200 },
  { day: "Wed", fees: 7800 },
  { day: "Thu", fees: 10500 },
  { day: "Fri", fees: 12300 },
  { day: "Sat", fees: 11800 },
  { day: "Sun", fees: 9600 },
]

const topPools = [
  {
    pair: "CNPY/USDC",
    tvl: "$12.6M",
    volume24h: "$3.4M",
    fees24h: "$10,200",
    apr: 6.8,
    change: "+12.5%",
  },
  {
    pair: "CNPY/ETH",
    tvl: "$8.1M",
    volume24h: "$2.1M",
    fees24h: "$6,300",
    apr: 8.7,
    change: "+8.2%",
  },
  {
    pair: "CNPY/SUPPLY",
    tvl: "$5.4M",
    volume24h: "$890K",
    fees24h: "$2,670",
    apr: 10.2,
    change: "+15.1%",
  },
  {
    pair: "CNPY/DEFI",
    tvl: "$4.2M",
    volume24h: "$1.2M",
    fees24h: "$3,600",
    apr: 12.5,
    change: "+18.7%",
  },
]

export function PoolAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$33.1M</div>
            <p className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18.2% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8.4M</div>
            <p className="text-xs text-primary">+12.5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25,200</div>
            <p className="text-xs text-muted-foreground">0.3% trading fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active LPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-primary">+45 this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* TVL & Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              TVL & Volume Trends
            </CardTitle>
            <CardDescription>Total Value Locked and trading volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tvlData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-muted-foreground" />
                  <YAxis tickFormatter={(value) => `$${value}M`} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value: number, name: string) => [`$${value}M`, name === "tvl" ? "TVL" : "Volume"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tvl"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stackId="2"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pool Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Pool Distribution
            </CardTitle>
            <CardDescription>TVL distribution across CNPY hub pools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={poolDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {poolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      poolDistribution.find((d) => d.name === name)?.amount,
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Daily Fee Revenue
          </CardTitle>
          <CardDescription>Trading fees generated across all pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} className="text-muted-foreground" />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Fees"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="fees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Pools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performing Pools
          </CardTitle>
          <CardDescription>Highest volume and fee generating pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPools.map((pool, index) => (
              <div key={pool.pair} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                  <div className="space-y-1">
                    <div className="font-medium">{pool.pair}</div>
                    <div className="text-sm text-muted-foreground">TVL: {pool.tvl}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-8 text-right">
                  <div>
                    <div className="text-sm text-muted-foreground">24h Volume</div>
                    <div className="font-medium">{pool.volume24h}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">24h Fees</div>
                    <div className="font-medium">{pool.fees24h}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">APR</div>
                    <div className="font-medium text-primary">{pool.apr}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Change</div>
                    <Badge variant="outline" className="text-primary">
                      {pool.change}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
