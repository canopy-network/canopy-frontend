import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function LiquidityWithdrawDialog({ 
  open, 
  onClose,
  onConfirm,
  tokenA,
  tokenB,
  amountA,
  amountB,
  lpTokens,
  pool,
  networkFee = 0.2333, // Default network fee in CNPY
  duration = 4 // seconds for pending state
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [view, setView] = useState('confirm') // 'confirm', 'pending', 'success'
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
      setView('confirm')
      setTimeLeft(duration)
      setProgress(0)
    } else {
      setIsAnimating(false)
    }
  }, [open, duration])

  // Timer effect for pending state
  useEffect(() => {
    if (view !== 'pending') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setView('success')
          return 0
        }
        return prev - 1
      })
      setProgress((prev) => Math.min(prev + (100 / duration), 100))
    }, 1000)

    return () => clearInterval(interval)
  }, [view, duration])

  const handleWithdraw = () => {
    setView('pending')
    setTimeLeft(duration)
    setProgress(0)
  }

  const handleDone = () => {
    onConfirm && onConfirm()
    onClose()
  }

  if (!tokenA || !tokenB) return null

  // Calculate values
  const amountAValue = parseFloat(amountA) || 0
  const amountBValue = parseFloat(amountB) || 0
  const usdValueA = amountAValue * (tokenA.currentPrice || 0)
  const usdValueB = amountBValue * (tokenB.currentPrice || 0)
  const totalUSD = usdValueA + usdValueB
  const networkFeeUSD = networkFee * (tokenB.currentPrice || 0)

  // Pool share calculation (mock)
  const currentShare = 0.322
  const newShare = 0.221

  // Timer formatting
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const circumference = 2 * Math.PI * 80
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 -top-[500px] bg-black/80 z-10 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={view === 'confirm' ? onClose : undefined}
      />

      {/* Dialog Content */}
      <div 
        className={`absolute inset-x-0 bottom-0 z-20 bg-background rounded-2xl transition-transform duration-300 ease-out ${
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

        {view === 'confirm' && (
          <>
            <div className="p-6 pt-6 pb-4">
              {/* Token Icons - Overlapping */}
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-background z-10"
                    style={{ backgroundColor: tokenA.brandColor || '#ef4444' }}
                  >
                    {tokenA.logo ? (
                      <img src={tokenA.logo} alt={tokenA.symbol} className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-base font-bold text-white">
                        {tokenA.symbol[0]}
                      </span>
                    )}
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-background"
                    style={{ backgroundColor: tokenB.brandColor || '#10b981' }}
                  >
                    {tokenB.logo ? (
                      <img src={tokenB.logo} alt={tokenB.symbol} className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-base font-bold text-white">
                        {tokenB.symbol[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Withdraw Amount */}
              <div className="text-center space-y-1.5 mb-4">
                <h2 className="text-xl font-bold">
                  Withdraw ${totalUSD.toFixed(0)} worth of{' '}
                  <span className="text-muted-foreground">{tokenA.symbol}</span>
                  {' '}and{' '}
                  <span className="text-muted-foreground">{tokenB.symbol}</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {amountAValue.toFixed(2)} {tokenA.symbol} and {amountBValue.toFixed(2)} {tokenB.symbol}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="px-6 space-y-2">
              {/* You'll Receive */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">You'll receive</span>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {amountAValue.toFixed(2)} {tokenA.symbol} + {amountBValue.toFixed(2)} {tokenB.symbol}
                  </p>
                </div>
              </div>

              {/* Share of Pool */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Share of pool</span>
                <p className="text-sm font-semibold">
                  {currentShare}% → <span className="text-red-500">{newShare}%</span>
                </p>
              </div>

              {/* Remaining Position */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining position</span>
                <p className="text-sm font-semibold">
                  ${(250.90 - totalUSD).toFixed(2)}
                </p>
              </div>

              {/* Network Fee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Fee</span>
                <p className="text-sm font-semibold">
                  ${networkFeeUSD.toFixed(2)} ({networkFee.toFixed(4)} CNPY)
                </p>
              </div>
            </div>

            {/* Withdraw Button */}
            <div className="p-6 pt-4">
              <Button 
                className="w-full h-11 text-base"
                size="lg"
                onClick={handleWithdraw}
              >
                Withdraw
              </Button>
            </div>
          </>
        )}

        {view === 'pending' && (
          <div className="p-6 pt-12 pb-6 flex flex-col items-center">
            {/* Countdown Timer with Progress Circle */}
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000 ease-linear"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Time left</p>
                <p className="text-4xl font-bold tabular-nums">{formatTime(timeLeft)}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">Withdrawing liquidity...</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Removing {amountAValue.toFixed(2)} {tokenA.symbol} and {amountBValue.toFixed(2)} {tokenB.symbol} from the pool
            </p>

            <Button 
              variant="secondary"
              className="w-full h-11 text-base"
              size="lg"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}

        {view === 'success' && (
          <div className="p-6 pt-8 pb-6 flex flex-col items-center">
            {/* Token Icons */}
            <div className="flex -space-x-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-background z-10"
                style={{ backgroundColor: tokenA.brandColor || '#ef4444' }}
              >
                {tokenA.logo ? (
                  <img src={tokenA.logo} alt={tokenA.symbol} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-sm font-bold text-white">{tokenA.symbol[0]}</span>
                )}
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-background"
                style={{ backgroundColor: tokenB.brandColor || '#10b981' }}
              >
                {tokenB.logo ? (
                  <img src={tokenB.logo} alt={tokenB.symbol} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-sm font-bold text-white">{tokenB.symbol[0]}</span>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center mb-1">
              Withdrew{' '}
              <span className="text-muted-foreground">{tokenA.symbol}/{tokenB.symbol}</span>
            </h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              {amountAValue.toFixed(2)} {tokenA.symbol} + {amountBValue.toFixed(2)} {tokenB.symbol}
            </p>

            {/* Transaction Details */}
            <div className="w-full space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Received</span>
                <span className="text-sm font-medium">
                  ${totalUSD.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction Date</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}, {new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  }).toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining Position</span>
                <span className="text-sm font-medium">
                  ${(250.90 - totalUSD).toFixed(2)}
                </span>
              </div>
            </div>

            <Button 
              variant="secondary"
              className="w-full h-10 text-sm"
              size="lg"
              onClick={handleDone}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </>
  )
}


