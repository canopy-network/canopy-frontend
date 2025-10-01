"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, TrendingUp, Users, DollarSign } from "lucide-react"

interface LiquidityProvider {
  id: string
  address: string
  cnpyAmount: number
  usdcAmount: number
  totalValue: number
  share: number
  rewards24h: number
  apy: number
  status: "active" | "inactive"
}

export function LiquidityProviders() {
  const providers: LiquidityProvider[] = [
    {
      id: "1",
      address: "0x1234...5678",
      cnpyAmount: 500000,
      usdcAmount: 622750,
      totalValue: 1245500,
      share: 12.5,
      rewards24h: 156.89,
      apy: 18.5,
      status: "active",
    },
    {
      id: "2",
      address: "0x2345...6789",
      cnpyAmount: 300000,
      usdcAmount: 373650,
      totalValue: 747300,
      share: 7.5,
      rewards24h: 94.13,
      apy: 17.8,
      status: "active",
    },
    {
      id: "3",
      address: "0x3456...7890",
      cnpyAmount: 750000,
      usdcAmount: 934125,
      totalValue: 1868250,
      share: 18.7,
      rewards24h: 235.22,
      apy: 19.2,
      status: "active",
    },
  ]

  const totalLiquidity = 9980000
  const totalProviders = 89
  const avgApy = 18.1

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Liquidity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalLiquidity.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <Badge className="bg-green-500/10 text-green-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.2%
              </Badge>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProviders}</div>
            <div className="flex items-center space-x-1 text-xs">
              <Badge className="bg-green-500/10 text-green-500">+8</Badge>
              <span className="text-muted-foreground">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgApy}%</div>
            <div className="flex items-center space-x-1 text-xs">
              <Badge className="bg-green-500/10 text-green-500">+0.3%</Badge>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liquidity Management */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </TabsTrigger>
                <TabsTrigger value="remove">
                  <Minus className="w-4 h-4 mr-2" />
                  Remove
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpy-amount">CNPY Amount</Label>
                  <Input id="cnpy-amount" placeholder="10,000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usdc-amount">USDC Amount</Label>
                  <Input id="usdc-amount" placeholder="12,455" />
                </div>
                <div className="space-y-2">
                  <Label>Pool Share</Label>
                  <div className="p-2 bg-muted rounded text-sm">~0.25% of pool</div>
                </div>
                <Button className="w-full">Add Liquidity</Button>
              </TabsContent>

              <TabsContent value="remove" className="space-y-4">
                <div className="space-y-2">
                  <Label>Remove Percentage</Label>
                  <div className="space-y-2">
                    <Progress value={25} className="w-full" />
                    <div className="flex justify-between text-sm">
                      <span>25%</span>
                      <span>~$3,113</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" size="sm">
                    25%
                  </Button>
                  <Button variant="outline" size="sm">
                    50%
                  </Button>
                  <Button variant="outline" size="sm">
                    75%
                  </Button>
                  <Button variant="outline" size="sm">
                    100%
                  </Button>
                </div>
                <Button variant="destructive" className="w-full">
                  Remove Liquidity
                </Button>
              </TabsContent>
            </Tabs>

            {/* Current Position */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your CNPY:</span>
                <span className="font-mono">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Your USDC:</span>
                <span className="font-mono">$0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pool Share:</span>
                <span className="font-mono">0%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rewards (24h):</span>
                <span className="font-mono text-green-500">$0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Liquidity Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((provider, index) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-sm">{provider.address}</div>
                      <div className="text-xs text-muted-foreground">{provider.share}% of pool</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${provider.totalValue.toLocaleString()}</div>
                    <div className="text-sm text-green-500">{provider.apy}% APY</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Distribution (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">$45,230</div>
              <div className="text-sm text-muted-foreground">Total Rewards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$37,642</div>
              <div className="text-sm text-muted-foreground">To LPs (83.3%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$7,588</div>
              <div className="text-sm text-muted-foreground">To Treasury (16.7%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">18.1%</div>
              <div className="text-sm text-muted-foreground">Avg APY</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
