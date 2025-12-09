import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const PRESET_SLIPPAGE = [0.1, 0.5, 1.0]

export default function SlippageSettings({ open, onOpenChange, slippage, onSlippageChange }) {
  const [customValue, setCustomValue] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const handlePresetClick = (value) => {
    setIsCustom(false)
    setCustomValue('')
    onSlippageChange(value)
  }

  const handleCustomChange = (value) => {
    setCustomValue(value)
    setIsCustom(true)
    
    // Only update if it's a valid number
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue)
    }
  }

  const isPresetSelected = (value) => {
    return !isCustom && slippage === value
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Slippage Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Slippage tolerance
            </p>
            
            {/* Preset buttons */}
            <div className="flex gap-2 mb-3">
              {PRESET_SLIPPAGE.map((value) => (
                <Button
                  key={value}
                  variant={isPresetSelected(value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetClick(value)}
                  className="flex-1"
                >
                  {value}%
                </Button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Custom"
                  value={customValue}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow numbers and decimal point
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      handleCustomChange(value)
                    }
                  }}
                  className={isCustom ? 'border-primary' : ''}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Warning for high slippage */}
          {slippage > 5 && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                ⚠️ High slippage tolerance! Your transaction may be frontrun.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

