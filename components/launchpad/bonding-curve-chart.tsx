"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import { ShoppingCart, X } from "lucide-react"

interface BondingCurveChartProps {
  project: {
    id: string
    name: string
    description: string
    creator: string
    progress: number
    raised: string
    target: string
    participants: number
    timeLeft: string
    status: string
    bondingCurve: { price: number; supply: number }[]
  }
  isOpen: boolean
  onClose: () => void
}

export function BondingCurveChart({ project, isOpen, onClose }: BondingCurveChartProps) {
  const [buyAmount, setBuyAmount] = useState("")
  const [sellAmount, setSellAmount] = useState("")

  const currentPrice = project.bondingCurve[project.bondingCurve.length - 1]?.price || 0
  const currentSupply = Number.parseInt(project.raised.replace(",", ""))

  const handleBuy = () => {
    console.log("Buying", buyAmount, "tokens")
    setBuyAmount("")
  }

  const handleSell = () => {
    console.log("Selling", sellAmount, "tokens")
    setSellAmount("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-h-[95vh] overflow-auto p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {project.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-4 p-4">
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-xs text-muted-foreground mb-1">Price</div>
                <div className="text-lg font-bold">${currentPrice.toFixed(3)}</div>
                <div className="text-xs text-green-500">+12.5%</div>
              </div>
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                <div className="text-lg font-bold">${(currentSupply * currentPrice).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Virtual</div>
              </div>
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-xs text-muted-foreground mb-1">Supply</div>
                <div className="text-lg font-bold">{currentSupply.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Tokens</div>
              </div>
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-xs text-muted-foreground mb-1">Progress</div>
                <div className="text-lg font-bold">{project.progress}%</div>
                <div className="text-xs text-muted-foreground">To AMM</div>
              </div>
            </div>

            <Card className="border-0 bg-card/30">
              <CardContent className="p-4">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={project.bondingCurve}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="supply"
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        className="text-muted-foreground text-xs"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                        className="text-muted-foreground text-xs"
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(3)}`, "Price"]}
                        labelFormatter={(value) => `Supply: ${Number.parseInt(value).toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, stroke: "#22c55e", strokeWidth: 2, fill: "#22c55e" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 bg-card/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Creator</span>
                  <span className="text-xs font-mono">{project.creator.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Holders</span>
                  <span className="text-xs font-medium">{project.participants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Raised</span>
                  <span className="text-xs font-medium">
                    ${project.raised} / ${project.target}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Quick Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="buy-amount" className="text-xs">
                    Buy Amount (CNPY)
                  </Label>
                  <Input
                    id="buy-amount"
                    placeholder="100"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    onClick={handleBuy}
                    className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                    disabled={!buyAmount}
                  >
                    Buy Tokens
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sell-amount" className="text-xs">
                    Sell Amount (Tokens)
                  </Label>
                  <Input
                    id="sell-amount"
                    placeholder="50"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    onClick={handleSell}
                    variant="outline"
                    className="w-full h-8 text-xs bg-transparent"
                    disabled={!sellAmount}
                  >
                    Sell Tokens
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded text-center">
                  Price increases with each purchase via bonding curve
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
