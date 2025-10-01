"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink } from "lucide-react"

interface Trade {
  id: string
  timestamp: string
  type: "buy" | "sell"
  price: number
  amount: number
  total: number
  fee: number
  status: "completed" | "pending" | "failed"
  txHash: string
  chain: string
}

export function TradeHistory() {
  const trades: Trade[] = [
    {
      id: "1",
      timestamp: "2024-01-15 14:32:15",
      type: "buy",
      price: 1.2455,
      amount: 25000,
      total: 31137.5,
      fee: 15.57,
      status: "completed",
      txHash: "0x1234...5678",
      chain: "Ethereum",
    },
    {
      id: "2",
      timestamp: "2024-01-15 13:45:22",
      type: "sell",
      price: 1.244,
      amount: 15000,
      total: 18660,
      fee: 9.33,
      status: "completed",
      txHash: "0x2345...6789",
      chain: "Polygon",
    },
    {
      id: "3",
      timestamp: "2024-01-15 12:18:45",
      type: "buy",
      price: 1.243,
      amount: 50000,
      total: 62150,
      fee: 31.08,
      status: "pending",
      txHash: "0x3456...7890",
      chain: "Arbitrum",
    },
    {
      id: "4",
      timestamp: "2024-01-15 11:22:33",
      type: "sell",
      price: 1.2465,
      amount: 30000,
      total: 37395,
      fee: 18.7,
      status: "completed",
      txHash: "0x4567...8901",
      chain: "Optimism",
    },
    {
      id: "5",
      timestamp: "2024-01-15 10:15:18",
      type: "buy",
      price: 1.242,
      amount: 40000,
      total: 49680,
      fee: 24.84,
      status: "failed",
      txHash: "0x5678...9012",
      chain: "Base",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search by transaction hash..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Trade List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium text-muted-foreground">Time</th>
                  <th className="p-4 font-medium text-muted-foreground">Type</th>
                  <th className="p-4 font-medium text-muted-foreground">Price</th>
                  <th className="p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="p-4 font-medium text-muted-foreground">Total</th>
                  <th className="p-4 font-medium text-muted-foreground">Fee</th>
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-muted-foreground">Chain</th>
                  <th className="p-4 font-medium text-muted-foreground">Tx</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{trade.timestamp}</td>
                    <td className="p-4">
                      <Badge
                        variant={trade.type === "buy" ? "default" : "secondary"}
                        className={
                          trade.type === "buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }
                      >
                        {trade.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono">${trade.price.toFixed(4)}</td>
                    <td className="p-4 font-mono">{trade.amount.toLocaleString()}</td>
                    <td className="p-4 font-mono">${trade.total.toLocaleString()}</td>
                    <td className="p-4 font-mono">${trade.fee.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          trade.status === "completed"
                            ? "default"
                            : trade.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          trade.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : trade.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                        }
                      >
                        {trade.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{trade.chain}</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Volume</div>
            <div className="text-2xl font-bold">$199,022.50</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Fees</div>
            <div className="text-2xl font-bold">$99.52</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg. Price</div>
            <div className="text-2xl font-bold">$1.2442</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Success Rate</div>
            <div className="text-2xl font-bold">80%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
