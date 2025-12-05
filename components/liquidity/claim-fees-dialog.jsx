import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Check, Coins } from 'lucide-react'
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

export default function ClaimFeesDialog({ open, onOpenChange, position, onClaimSuccess }) {
  const [step, setStep] = useState(1)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1)
    }
  }, [open])

  if (!position) return null

  const tokenBData = tokens.find(t => t.symbol === position.tokenB)

  // Calculate claimable fees (mock - split between both tokens)
  const claimableA = (position.earnings * 0.4).toFixed(4) // 40% in CNPY
  const claimableB = (position.earnings * 0.6 / (tokenBData?.price || 1)).toFixed(4) // 60% in tokenB

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2)
      // Notify parent of successful claim
      if (onClaimSuccess) {
        onClaimSuccess(position)
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
            {step === 1 ? 'Claim Fees' : 'Fees Claimed!'}
          </DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {step === 1 && (
            <>
              {/* Position Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <TokenAvatar symbol={position.tokenB} color={tokenBData?.brandColor} size={32} />
                    <TokenAvatar symbol={position.tokenA} size={32} />
                  </div>
                  <div>
                    <div className="font-medium">{position.tokenB} / {position.tokenA}</div>
                    <div className="text-xs text-muted-foreground">
                      Position value: ${position.valueUSD.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Claimable Fees */}
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Available to Claim</div>
                <div className="text-3xl font-bold text-green-500">
                  ${position.earnings.toFixed(2)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="text-xs text-muted-foreground mb-2">You will receive:</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TokenAvatar symbol={position.tokenA} size={20} />
                    <span>{position.tokenA}</span>
                  </div>
                  <span className="font-medium">{claimableA}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TokenAvatar symbol={position.tokenB} color={tokenBData?.brandColor} size={20} />
                    <span>{position.tokenB}</span>
                  </div>
                  <span className="font-medium">{claimableB}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Claiming fees does not affect your liquidity position
              </p>

              <Button className="w-full" onClick={handleConfirm}>
                Claim Fees
              </Button>
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
                  <h3 className="text-lg font-semibold">Fees Claimed!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your fees have been sent to your wallet
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TokenAvatar symbol={position.tokenA} size={20} />
                      <span>{position.tokenA}</span>
                    </div>
                    <span className="font-medium text-green-500">+{claimableA}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TokenAvatar symbol={position.tokenB} color={tokenBData?.brandColor} size={20} />
                      <span>{position.tokenB}</span>
                    </div>
                    <span className="font-medium text-green-500">+{claimableB}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-medium">${position.earnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
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


