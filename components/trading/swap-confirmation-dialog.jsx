import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function SwapConfirmationDialog({ 
  open, 
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  networkFee = 0.2333 // Default network fee in CNPY
}) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
    }
  }, [open])

  if (!fromToken || !toToken) return null

  // Calculate values
  const usdValue = parseFloat(fromAmount) * (fromToken.currentPrice || 0)
  const networkFeeUSD = networkFee * (toToken.currentPrice || 0)
  const totalUSD = usdValue + networkFeeUSD
  const payWithAmount = totalUSD / (fromToken.currentPrice || 1)

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 z-10 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Confirmation Content */}
      <div 
        className={`absolute inset-x-0 bottom-0 z-20 bg-background rounded-t-2xl transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 pt-4 pb-4">
          {/* Token Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: toToken.brandColor || '#10b981' }}
            >
              {toToken.logo ? (
                <img src={toToken.logo} alt={toToken.symbol} className="w-full h-full rounded-full" />
              ) : (
                <span className="text-xl font-bold text-white">
                  {toToken.symbol[0]}
                </span>
              )}
            </div>
          </div>

          {/* Buy Amount */}
          <div className="text-center space-y-1.5 mb-4">
            <h2 className="text-xl font-bold">
              Buy ${usdValue.toFixed(0)} worth of{' '}
              <span className="text-muted-foreground">{toToken.symbol}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              at ${toToken.currentPrice?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="px-6 space-y-1.5">
          {/* Network Fee */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Network Fee</span>
            <div className="text-right">
              <p className="text-sm font-semibold">
                ${networkFeeUSD.toFixed(2)} ({networkFee.toFixed(4)} {toToken.symbol})
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold">Total</span>
            <p className="text-base font-bold">${totalUSD.toFixed(0)}</p>
          </div>

          {/* Pay With */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold">Pay with</span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: fromToken.brandColor || '#10b981' }}
              >
                {fromToken.logo ? (
                  <img src={fromToken.logo} alt={fromToken.symbol} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {fromToken.symbol[0]}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold">
                {payWithAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${fromToken.symbol}
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="p-6 pt-4">
          <Button 
            className="w-full h-11 text-base"
            size="lg"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    </>
  )
}
