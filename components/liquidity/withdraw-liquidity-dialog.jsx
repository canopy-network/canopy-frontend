import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { X, ArrowLeft, Check, AlertTriangle, Clock } from 'lucide-react'
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

export default function WithdrawLiquidityDialog({ open, onOpenChange, position, onWithdrawSuccess }) {
  const [step, setStep] = useState(1)
  const [percentage, setPercentage] = useState(100)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1)
      setPercentage(100)
    }
  }, [open])

  if (!position) return null

  const tokenBData = tokens.find(t => t.symbol === position.tokenB)

  // Calculate withdrawal amounts based on percentage
  const withdrawAmountA = (position.tokenAAmount * percentage / 100).toFixed(4)
  const withdrawAmountB = (position.tokenBAmount * percentage / 100).toFixed(4)
  const withdrawValueUSD = (position.valueUSD * percentage / 100).toFixed(2)
  const earningsToReceive = (position.earnings * percentage / 100).toFixed(2)

  const handlePresetPercentage = (value) => {
    setPercentage(value)
  }

  const handleContinue = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
      // Notify parent of successful withdrawal
      if (onWithdrawSuccess) {
        onWithdrawSuccess(position, percentage)
      }
    }
  }

  const handleBack = () => {
    if (step === 2) setStep(1)
  }

  const handleClose = () => {
    setStep(1)
    setPercentage(100)
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
          <div className="flex items-center gap-3">
            {step === 2 && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="text-lg font-semibold">
              {step === 1 ? 'Withdraw Liquidity' : step === 2 ? 'Confirm Withdrawal' : 'Withdrawal Initiated'}
            </DialogTitle>
          </div>
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
                      {position.share}% share of pool
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${position.valueUSD.toFixed(2)}</div>
                  <div className="text-xs text-green-500">+${position.earnings.toFixed(2)} earned</div>
                </div>
              </div>

              {/* Percentage Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount to Withdraw</span>
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>

                <Slider
                  value={[percentage]}
                  onValueChange={([value]) => setPercentage(value)}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />

                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((preset) => (
                    <Button
                      key={preset}
                      variant={percentage === preset ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePresetPercentage(preset)}
                    >
                      {preset}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You will receive ({position.tokenA})</span>
                  <span>{withdrawAmountA} {position.tokenA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You will receive ({position.tokenB})</span>
                  <span>{withdrawAmountB} {position.tokenB}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value</span>
                  <span>${withdrawValueUSD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees Earned</span>
                  <span className="text-green-500">+${earningsToReceive}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleContinue}>
                Continue
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Confirmation Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="text-center">
                    <div className="flex justify-center -space-x-2 mb-2">
                      <TokenAvatar symbol={position.tokenB} color={tokenBData?.brandColor} size={40} />
                      <TokenAvatar symbol={position.tokenA} size={40} />
                    </div>
                    <div className="text-lg font-semibold">{position.tokenB} / {position.tokenA}</div>
                    <div className="text-sm text-muted-foreground">Withdraw {percentage}%</div>
                  </div>

                  <div className="border-t border-border pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receiving {position.tokenA}</span>
                      <span className="font-medium">{withdrawAmountA} {position.tokenA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receiving {position.tokenB}</span>
                      <span className="font-medium">{withdrawAmountB} {position.tokenB}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-medium">${withdrawValueUSD}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees Earned</span>
                      <span className="font-medium text-green-500">+${earningsToReceive}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-500">
                    Withdrawal will be processed within 24 hours. You can track the status in the Withdrawing tab.
                  </p>
                </div>
              </div>

              <Button className="w-full" onClick={handleContinue}>
                Confirm Withdrawal
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              {/* Success State */}
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Withdrawal Initiated!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your withdrawal request has been submitted
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool</span>
                    <span>{position.tokenB} / {position.tokenA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span>{percentage}% of position</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <span>~24 hours</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  You can track the withdrawal status in the "Withdrawing" tab
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


