import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import tokensData from '@/data/tokens.json'

// CNPY Logo component
function CnpyLogo({ size = 20 }) {
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
function TokenAvatar({ symbol, color, size = 20 }) {
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

export default function YourPositionCard({ position, pool, onWithdraw }) {
  if (!position || !pool) return null

  const tokenAData = tokensData.find(t => t.symbol === pool.tokenA)
  const tokenBData = tokensData.find(t => t.symbol === pool.tokenB)

  return (
    <Card className="p-4">
      <div className="text-sm font-medium mb-3">Your Position</div>
      
      <div className="space-y-4">
        {/* Value & Earnings Row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Value</div>
            <div className="text-xl font-bold">
              ${position.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Earned</div>
            <div className="text-xl font-bold text-green-500">
              +${position.earnings.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Token Amounts */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TokenAvatar symbol={pool.tokenA} color={tokenAData?.brandColor} size={20} />
              <span className="text-muted-foreground">{pool.tokenA}</span>
            </div>
            <span className="font-medium">{position.tokenAAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TokenAvatar symbol={pool.tokenB} color={tokenBData?.brandColor} size={20} />
              <span className="text-muted-foreground">{pool.tokenB}</span>
            </div>
            <span className="font-medium">{position.tokenBAmount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Pool Share */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
          <span className="text-muted-foreground">Pool share</span>
          <span className="font-medium">{position.share.toFixed(2)}%</span>
        </div>
        
        {/* Withdraw Button */}
        <Button 
          variant="outline"
          className="w-full mt-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onWithdraw}
        >
          Withdraw ${position.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Button>
      </div>
    </Card>
  )
}

