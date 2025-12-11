"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { orderbookApi } from "@/lib/api"
import { useWalletStore } from "@/lib/stores/wallet-store"
import type { OrderBookApiOrder, DisplayOrder } from "@/types/orderbook"

const DECIMALS = 1_000_000 // 6 decimals
const ORDER_COMMITTEE_ID = 3 // Committee responsible for counter-asset swaps

function transformOrder(order: OrderBookApiOrder): DisplayOrder {
  const amount = order.amountForSale / DECIMALS
  const total = order.requestedAmount / DECIMALS
  const price = order.requestedAmount / order.amountForSale
  return {
    id: order.id,
    price,
    amount,
    total,
  }
}

export function OrderBookInterface() {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")

  // API state
  const [sellOrders, setSellOrders] = useState<DisplayOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Wallet store
  const { currentWallet, createOrder, isLoading: walletLoading } = useWalletStore()

  const fetchOrderBook = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await orderbookApi.getOrderBook({ chainId: ORDER_COMMITTEE_ID })
      // response.data is an array of ChainOrderBook
      const orderBooks = response.data || []
      // Flatten all orders from all chains and transform them
      const allOrders = orderBooks.flatMap((book) =>
        (book.orders || []).map(transformOrder)
      )
      // Sort by price descending (highest price first for sell orders)
      allOrders.sort((a, b) => b.price - a.price)
      setSellOrders(allOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order book")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrderBook()
  }, [fetchOrderBook])

  // Handle placing an order
  const handlePlaceOrder = async () => {
    // Clear previous messages
    setSubmitError(null)
    setSubmitSuccess(null)

    // Validate wallet
    if (!currentWallet) {
      setSubmitError("Please connect a wallet first")
      return
    }

    if (!currentWallet.isUnlocked) {
      setSubmitError("Please unlock your wallet first")
      return
    }

    // Validate inputs
    const priceValue = parseFloat(price)
    const amountValue = parseFloat(amount.replace(/,/g, ""))

    if (isNaN(priceValue) || priceValue <= 0) {
      setSubmitError("Please enter a valid price")
      return
    }

    if (isNaN(amountValue) || amountValue <= 0) {
      setSubmitError("Please enter a valid amount")
      return
    }

    setIsSubmitting(true)

    try {
      let amountForSale: number
      let requestedAmount: number

      if (orderType === "sell") {
        // Selling CNPY for USDC
        // amountForSale = CNPY amount in micro units
        // requestedAmount = USDC amount (CNPY * price) in micro units
        amountForSale = Math.round(amountValue * DECIMALS)
        requestedAmount = Math.round(amountValue * priceValue * DECIMALS)
      } else {
        // Buying CNPY with USDC (reverse order - selling USDC for CNPY)
        // amountForSale = USDC amount (CNPY * price) in micro units
        // requestedAmount = CNPY amount in micro units
        amountForSale = Math.round(amountValue * priceValue * DECIMALS)
        requestedAmount = Math.round(amountValue * DECIMALS)
      }

      const txHash = await createOrder(ORDER_COMMITTEE_ID, amountForSale, requestedAmount)

      setSubmitSuccess(`Order created! TX: ${txHash.slice(0, 16)}...`)

      // Clear form
      setPrice("")
      setAmount("")

      // Refresh order book after a short delay
      setTimeout(() => {
        fetchOrderBook()
      }, 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate current price from best sell order, or use placeholder
  const currentPrice = sellOrders.length > 0
    ? sellOrders[sellOrders.length - 1].price
    : 0
  const priceChange = 0
  const priceChangePercent = 0

  // Calculate total for display
  const calculatedTotal = price && amount
    ? (parseFloat(price) * parseFloat(amount.replace(/,/g, ""))).toLocaleString()
    : "0.00"

  const isWalletReady = currentWallet?.isUnlocked
  const isButtonDisabled = isSubmitting || walletLoading || !isWalletReady

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Book */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Book - CNPY/USDC</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {currentPrice > 0 ? `$${currentPrice.toFixed(4)}` : "--"}
              </div>
              {currentPrice > 0 && (
                <Badge variant="default" className="bg-green-500/10 text-green-500">
                  <TrendingUp className="w-3 h-3 mr-1" />+{priceChange.toFixed(4)} ({priceChangePercent}%)
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading order book...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sell Orders */}
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Price (USDC)</span>
                  <span>Amount (CNPY)</span>
                  <span>Total (USDC)</span>
                </div>
                <div className="space-y-1">
                  {sellOrders.length > 0 ? (
                    sellOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center p-2 rounded hover:bg-red-500/5 border-l-2 border-red-500/20"
                      >
                        <span className="text-red-500 font-mono">{order.price.toFixed(4)}</span>
                        <span className="font-mono">{order.amount.toLocaleString()}</span>
                        <span className="font-mono">${order.total.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sell orders available
                    </div>
                  )}
                </div>
              </div>

              {/* Current Price */}
              <div className="flex items-center justify-center py-2 border-y">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-bold">
                    {currentPrice > 0 ? `$${currentPrice.toFixed(4)}` : "--"}
                  </span>
                  <span className="text-sm text-green-500">Last Price</span>
                </div>
              </div>

              {/* Buy Orders */}
              <div>
                <div className="space-y-1">
                  <div className="text-center py-4 text-muted-foreground">
                    No buy orders available
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Status */}
          {!currentWallet && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-500 rounded-md text-sm">
              <AlertCircle className="w-4 h-4" />
              Please connect a wallet to place orders
            </div>
          )}
          {currentWallet && !currentWallet.isUnlocked && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-500 rounded-md text-sm">
              <AlertCircle className="w-4 h-4" />
              Please unlock your wallet to place orders
            </div>
          )}

          {/* Success/Error Messages */}
          {submitSuccess && (
            <div className="p-3 bg-green-500/10 text-green-500 rounded-md text-sm">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-md text-sm">
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </div>
          )}

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
                <Input
                  id="buy-price"
                  placeholder="1.2450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount (CNPY)</Label>
                <Input
                  id="buy-amount"
                  placeholder="10,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Total (USDC)</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  ${calculatedTotal}
                </div>
              </div>
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handlePlaceOrder}
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Buy Order"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-price">Price (USDC)</Label>
                <Input
                  id="sell-price"
                  placeholder="1.2460"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount (CNPY)</Label>
                <Input
                  id="sell-amount"
                  placeholder="10,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Total (USDC)</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  ${calculatedTotal}
                </div>
              </div>
              <Button
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={handlePlaceOrder}
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Sell Order"
                )}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label>Quick Fill</Label>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" disabled={isSubmitting}>
                25%
              </Button>
              <Button variant="outline" size="sm" disabled={isSubmitting}>
                50%
              </Button>
              <Button variant="outline" size="sm" disabled={isSubmitting}>
                75%
              </Button>
              <Button variant="outline" size="sm" disabled={isSubmitting}>
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
