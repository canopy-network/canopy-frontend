import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import tokens from '@/data/tokens.json'
import liquidityPools from '@/data/liquidity-pools.json'

// CNPY Logo component
function CnpyLogo({ size = 32 }) {
  return (
    <div 
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ 
        width: size, 
        height: size,
        background: 'linear-gradient(135deg, #1dd13a 0%, #0fa32c 100%)'
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>C</span>
    </div>
  )
}

// Token Avatar component
function TokenAvatar({ symbol, color, size = 32 }) {
  if (symbol === 'CNPY') {
    return <CnpyLogo size={size} />
  }
  
  return (
    <div 
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ 
        width: size, 
        height: size,
        backgroundColor: color || '#6b7280'
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {symbol.slice(0, 2)}
      </span>
    </div>
  )
}

export default function LpEarningsHistorySheet({ open, onOpenChange, lpEarningsHistory = [], lpPositions = [] }) {
  // Calculate total earnings
  const totalEarnings = lpEarningsHistory.reduce((sum, earning) => sum + earning.amount, 0)
  
  // Group earnings by date
  const groupedByDate = lpEarningsHistory.reduce((acc, earning) => {
    const existing = acc.find(group => group.date === earning.date)
    if (existing) {
      existing.earnings.push(earning)
    } else {
      acc.push({ date: earning.date, earnings: [earning] })
    }
    return acc
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>LP Earnings History</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Fees Earned</div>
            <div className="text-2xl font-bold text-green-500">
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From {lpPositions.length} active position{lpPositions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Earnings List by Day */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-6 pr-4">
              {groupedByDate.length > 0 ? (
                groupedByDate.map((day, dayIndex) => {
                  const dayTotal = day.earnings.reduce((sum, earning) => sum + earning.amount, 0)
                  
                  return (
                    <div key={dayIndex}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">{day.date}</h3>
                        <span className="text-sm font-medium text-green-500">+${dayTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {day.earnings.map((earning) => {
                          const pool = liquidityPools.find(p => p.id === earning.poolId)
                          const tokenBData = tokens.find(t => t.symbol === earning.tokenB)
                          
                          return (
                            <div 
                              key={earning.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-1">
                                  <TokenAvatar symbol={earning.tokenB} color={tokenBData?.brandColor} size={28} />
                                  <TokenAvatar symbol="CNPY" size={28} />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {earning.tokenB} / CNPY
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {pool?.apr || 0}% APY
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-500">
                                  +${earning.amount.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Fee earnings
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No earnings history yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add liquidity to start earning fees
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}


