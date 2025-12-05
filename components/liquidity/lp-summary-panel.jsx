import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Plus, ArrowDownToLine } from 'lucide-react'

export default function LpSummaryPanel({ 
  lpPositions = [], 
  pools = [],
  onAddLiquidity,
  onViewHistory
}) {
  // Calculate total LP value
  const totalValue = lpPositions.reduce((sum, p) => sum + p.valueUSD, 0)
  
  // Calculate total fees earned
  const totalEarnings = lpPositions.reduce((sum, p) => sum + p.earnings, 0)
  
  // Calculate weighted APY
  const weightedApy = totalValue > 0 
    ? lpPositions.reduce((sum, p) => {
        const pool = pools.find(pool => pool.id === p.poolId)
        return sum + (pool?.apr || 0) * (p.valueUSD / totalValue)
      }, 0)
    : 0

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        {/* Metrics */}
        <div className="space-y-6">
          {/* Total LP Value */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm text-muted-foreground">Total LP Value</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total value of all your LP positions</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-3xl font-bold tracking-tight">
              {formatCurrency(totalValue)}
            </span>
          </div>

          {/* Secondary Metrics Row */}
          <div className="flex items-center gap-8">
            {/* Total Fees Earned */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm text-muted-foreground">Fees Earned</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total trading fees earned from providing liquidity</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xl font-semibold text-green-500">
                +${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Net APY */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm text-muted-foreground">Net APY</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Weighted average APY across all positions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xl font-semibold">
                {weightedApy.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={onAddLiquidity}>
            <Plus className="w-4 h-4" />
            Add Liquidity
          </Button>
          <Button variant="outline" className="gap-2" onClick={onViewHistory}>
            <ArrowDownToLine className="w-4 h-4" />
            History
          </Button>
        </div>
      </div>
    </Card>
  )
}
