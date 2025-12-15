d"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Shield, Activity, ExternalLink } from "lucide-react"

interface Chain {
  id: string
  name: string
  description: string
  status: "active" | "launching" | "graduated"
  tvl: string
  validators: number
  uptime: number
  transactions24h: number
  marketCap: string
  volume24h: string
  chartData: { time: string; tvl: number; volume: number }[]
}

const chains: Chain[] = [
  {
    id: "1",
    name: "DeFi Chain Alpha",
    description: "Next-generation DeFi infrastructure with cross-chain compatibility",
    status: "active",
    tvl: "$4.2M",
    validators: 45,
    uptime: 99.8,
    transactions24h: 12847,
    marketCap: "$8.4M",
    volume24h: "$1.2M",
    chartData: [
      { time: "00:00", tvl: 3800000, volume: 850000 },
      { time: "04:00", tvl: 3950000, volume: 920000 },
      { time: "08:00", tvl: 4100000, volume: 1100000 },
      { time: "12:00", tvl: 4200000, volume: 1200000 },
      { time: "16:00", tvl: 4150000, volume: 1050000 },
      { time: "20:00", tvl: 4200000, volume: 1200000 },
    ],
  },
  {
    id: "2",
    name: "GameFi Universe",
    description: "Gaming-focused blockchain with built-in NFT marketplace",
    status: "active",
    tvl: "$2.8M",
    validators: 32,
    uptime: 99.5,
    transactions24h: 8934,
    marketCap: "$5.6M",
    volume24h: "$680K",
    chartData: [
      { time: "00:00", tvl: 2600000, volume: 580000 },
      { time: "04:00", tvl: 2700000, volume: 620000 },
      { time: "08:00", tvl: 2750000, volume: 650000 },
      { time: "12:00", tvl: 2800000, volume: 680000 },
      { time: "16:00", tvl: 2780000, volume: 660000 },
      { time: "20:00", tvl: 2800000, volume: 680000 },
    ],
  },
  {
    id: "3",
    name: "Supply Chain Pro",
    description: "Enterprise supply chain tracking with privacy features",
    status: "active",
    tvl: "$5.4M",
    validators: 28,
    uptime: 99.9,
    transactions24h: 6234,
    marketCap: "$12.8M",
    volume24h: "$890K",
    chartData: [
      { time: "00:00", tvl: 5200000, volume: 800000 },
      { time: "04:00", tvl: 5300000, volume: 820000 },
      { time: "08:00", tvl: 5350000, volume: 850000 },
      { time: "12:00", tvl: 5400000, volume: 890000 },
      { time: "16:00", tvl: 5380000, volume: 870000 },
      { time: "20:00", tvl: 5400000, volume: 890000 },
    ],
  },
]

export function ChainOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {chains.map((chain) => (
          <Card key={chain.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{chain.name}</CardTitle>
                    <Badge variant={chain.status === "active" ? "default" : "secondary"}>{chain.status}</Badge>
                  </div>
                  <CardDescription className="text-pretty">{chain.description}</CardDescription>
                </div>
                <Button variant="outline" className="gap-2 bg-transparent">
                  View Details
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Stats */}
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Total Value Locked
                      </div>
                      <div className="text-2xl font-bold">{chain.tvl}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Validators
                      </div>
                      <div className="text-2xl font-bold">{chain.validators}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        Uptime
                      </div>
                      <div className="text-2xl font-bold">{chain.uptime}%</div>
                      <Progress value={chain.uptime} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        24h Transactions
                      </div>
                      <div className="text-2xl font-bold">{chain.transactions24h.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-2">
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium">TVL & Volume (24h)</h4>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Market Cap: {chain.marketCap}</span>
                      <span>24h Volume: {chain.volume24h}</span>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chain.chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="time" className="text-muted-foreground" />
                        <YAxis
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                          className="text-muted-foreground"
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `$${(value / 1000000).toFixed(2)}M`,
                            name === "tvl" ? "TVL" : "Volume",
                          ]}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
