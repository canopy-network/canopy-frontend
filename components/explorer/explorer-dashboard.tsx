"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChainOverview } from "./chain-overview"
import { ValidatorDirectory } from "./validator-directory"
import { StakingOpportunities } from "./staking-opportunities"
import { PortfolioView } from "./portfolio-view"
import { Search, Activity, Shield, TrendingUp, Zap, Globe } from "lucide-react"

const networkStats = [
  {
    title: "Total Chains",
    value: "24",
    change: "+3 this week",
    icon: Globe,
  },
  {
    title: "Total TVL",
    value: "$12.4M",
    change: "+18.2%",
    icon: TrendingUp,
  },
  {
    title: "Active Validators",
    value: "1,247",
    change: "+45 this month",
    icon: Shield,
  },
  {
    title: "Network Activity",
    value: "98.7%",
    change: "Uptime",
    icon: Activity,
  },
]

const recentBlocks = [
  {
    height: 2847392,
    hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    timestamp: "2 seconds ago",
    txCount: 45,
    validator: "Validator Alpha",
    chain: "DeFi Chain Alpha",
  },
  {
    height: 2847391,
    hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef123a",
    timestamp: "14 seconds ago",
    txCount: 32,
    validator: "Staking Pro",
    chain: "DeFi Chain Alpha",
  },
  {
    height: 1923847,
    hash: "0x3c4d5e6f7890abcdef1234567890abcdef123a2b",
    timestamp: "8 seconds ago",
    txCount: 28,
    validator: "GameFi Node",
    chain: "GameFi Universe",
  },
]

export function ExplorerDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Cross-Chain Explorer</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Discover chains, validators, and staking opportunities across the Canopy ecosystem.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chains, validators, or transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {networkStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-primary">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recent Blocks
          </CardTitle>
          <CardDescription>Latest blocks across all chains in the Canopy network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBlocks.map((block) => (
              <div key={block.height} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">#{block.height}</span>
                    <Badge variant="outline">{block.chain}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{block.hash}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{block.timestamp}</span>
                    <span>{block.txCount} transactions</span>
                    <span>by {block.validator}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Block
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Explorer Tabs */}
      <Tabs defaultValue="chains" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chains">Chains</TabsTrigger>
          <TabsTrigger value="validators">Validators</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="chains">
          <ChainOverview />
        </TabsContent>

        <TabsContent value="validators">
          <ValidatorDirectory />
        </TabsContent>

        <TabsContent value="staking">
          <StakingOpportunities />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
