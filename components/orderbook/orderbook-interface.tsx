"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, TrendingUp } from "lucide-react"

interface Order {
  id: string
  type: "buy" | "sell"
  price: number
  amount: number
  total: number
  filled: number
  status: "active" | "partial" | "filled"
}

export function OrderBookInterface() {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")

  // Mock order book data
  const buyOrders: Order[] = [
    { id: "1", type: "buy", price: 1.245, amount: 50000, total: 62250, filled: 0, status: "active" },
    { id: "2", type: "buy", price: 1.2445, amount: 75000, total: 93337.5, filled: 0, status: "active" },
    { id: "3", type: "buy", price: 1.244, amount: 100000, total: 124400, filled: 25000, status: "partial" },
    { id: "4", type: "buy", price: 1.2435, amount: 150000, total: 186525, filled: 0, status: "active" },
    { id: "5", type: "buy", price: 1.243, amount: 200000, total: 248600, filled: 0, status: "active" },
  ]

  const sellOrders: Order[] = [
    { id: "6", type: "sell", price: 1.246, amount: 45000, total: 56070, filled: 0, status: "active" },
    { id: "7", type: "sell", price: 1.2465, amount: 80000, total: 99720, filled: 0, status: "active" },
    { id: "8", type: "sell", price: 1.247, amount: 120000, total: 149640, filled: 60000, status: "partial" },
    { id: "9", type: "sell", price: 1.2475, amount: 90000, total: 112275, filled: 0, status: "active" },
    { id: "10", type: "sell", price: 1.248, amount: 110000, total: 137280, filled: 0, status: "active" },
  ]

  const currentPrice = 1.2455
  const priceChange = +0.0015
  const priceChangePercent = +0.12

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Book */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Book - CNPY/USDC</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">${currentPrice.toFixed(4)}</div>
              <Badge variant="default" className="bg-green-500/10 text-green-500">
                <TrendingUp className="w-3 h-3 mr-1" />+{priceChange.toFixed(4)} ({priceChangePercent}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sell Orders */}
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Price (USDC)</span>
                <span>Amount (CNPY)</span>
                <span>Total (USDC)</span>
              </div>
              <div className="space-y-1">
                {sellOrders.reverse().map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-2 rounded hover:bg-red-500/5 border-l-2 border-red-500/20"
                  >
                    <span className="text-red-500 font-mono">{order.price.toFixed(4)}</span>
                    <span className="font-mono">{order.amount.toLocaleString()}</span>
                    <span className="font-mono">${order.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Price */}
            <div className="flex items-center justify-center py-2 border-y">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">${currentPrice.toFixed(4)}</span>
                <span className="text-sm text-green-500">Last Price</span>
              </div>
            </div>

            {/* Buy Orders */}
            <div>
              <div className="space-y-1">
                {buyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-2 rounded hover:bg-green-500/5 border-l-2 border-green-500/20"
                  >
                    <span className="text-green-500 font-mono">{order.price.toFixed(4)}</span>
                    <span className="font-mono">{order.amount.toLocaleString()}</span>
                    <span className="font-mono">${order.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "buy" | "sell")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="text-green-500">
                Buy CNPY
              </TabsTrigger>
              <TabsTrigger value="sell" className="text-red-500">
                Sell CNPY
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-price">Price (USDC)</Label>
                <Input id="buy-price" placeholder="1.2450" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount (CNPY)</Label>
                <Input
                  id="buy-amount"
                  placeholder="10,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Total (USDC)</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {price && amount
                    ? `$${(Number.parseFloat(price) * Number.parseFloat(amount.replace(/,/g, ""))).toLocaleString()}`
                    : "$0.00"}
                </div>
              </div>
              <Button className="w-full bg-green-500 hover:bg-green-600">Place Buy Order</Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-price">Price (USDC)</Label>
                <Input id="sell-price" placeholder="1.2460" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount (CNPY)</Label>
                <Input
                  id="sell-amount"
                  placeholder="10,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Total (USDC)</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {price && amount
                    ? `$${(Number.parseFloat(price) * Number.parseFloat(amount.replace(/,/g, ""))).toLocaleString()}`
                    : "$0.00"}
                </div>
              </div>
              <Button className="w-full bg-red-500 hover:bg-red-600">Place Sell Order</Button>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label>Quick Fill</Label>
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
          </div>

          {/* Balance */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>CNPY Balance:</span>
              <span className="font-mono">125,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>USDC Balance:</span>
              <span className="font-mono">$50,000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
