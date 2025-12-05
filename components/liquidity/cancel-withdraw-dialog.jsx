import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Check } from 'lucide-react'
import tokens from '@/data/tokens.json'

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

export default function CancelWithdrawDialog({ open, onOpenChange, withdrawItem, onCancelSuccess }) {
  const [step, setStep] = useState(1)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1)
    }
  }, [open])

  if (!withdrawItem) return null

  const tokenBData = tokens.find(t => t.symbol === withdrawItem.tokenB)

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2)
      // Notify parent of successful cancellation
      if (onCancelSuccess) {
        onCancelSuccess(withdrawItem)
      }
    }
  }

  const handleClose = () => {
    setStep(1)
    onOpenChange(false)
  }

  const handleDone = () => {
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold">
            {step === 1 ? 'Cancel Withdrawal' : 'Withdrawal Cancelled'}
          </DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {step === 1 && (
            <>
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-500">Cancel this withdrawal?</p>
                  <p className="text-xs text-amber-500/80 mt-1">
                    Your liquidity will be returned to the pool and you can continue earning fees.
                  </p>
                </div>
              </div>

              {/* Withdrawal Info */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <TokenAvatar symbol={withdrawItem.tokenB} color={tokenBData?.brandColor} size={32} />
                    <TokenAvatar symbol={withdrawItem.tokenA} size={32} />
                  </div>
                  <div>
                    <div className="font-medium">{withdrawItem.tokenB} / {withdrawItem.tokenA}</div>
                    <div className="text-xs text-muted-foreground">Pending Withdrawal</div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{withdrawItem.tokenA} Amount</span>
                    <span>{withdrawItem.tokenAAmount} {withdrawItem.tokenA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{withdrawItem.tokenB} Amount</span>
                    <span>{withdrawItem.tokenBAmount} {withdrawItem.tokenB}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value</span>
                    <span>${withdrawItem.valueUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Remaining</span>
                    <span>{withdrawItem.hoursRemaining} hours</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Keep Withdrawal
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleConfirm}>
                  Cancel Withdrawal
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Success State */}
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Withdrawal Cancelled</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your liquidity has been returned to the pool
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool</span>
                    <span>{withdrawItem.tokenB} / {withdrawItem.tokenA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Returned Value</span>
                    <span>${withdrawItem.valueUSD.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  You can view your position in the "Your Positions" tab
                </p>
              </div>

              <Button className="w-full" onClick={handleDone}>
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


