import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import tokens from '@/data/tokens.json'

const TIME_RANGES = [
  { key: '1W', label: '1W', points: 7 },
  { key: '1M', label: '1M', points: 30 },
  { key: '3M', label: '3M', points: 12 },
  { key: 'All', label: 'All', points: 20 },
]

// Pool colors based on tokenB
const POOL_COLORS = {
  'OENS': '#10b981',
  'MGC': '#8b5cf6',
  'SOCN': '#ef4444',
  'DEFI': '#f59e0b',
  'SVLT': '#06b6d4',
  'HLTH': '#22c55e',
  'NFTX': '#ec4899',
  'GAME': '#f97316',
  'GOVR': '#6366f1',
  'META': '#a855f7',
}

// Generate mock historical earnings data
function generateEarningsData(lpPositions, timeRange) {
  const rangeConfig = TIME_RANGES.find(r => r.key === timeRange) || TIME_RANGES[0]
  const points = rangeConfig.points
  
  const data = []
  
  for (let i = 0; i < points; i++) {
    const progress = (i + 1) / points
    
    // Create data point
    const point = { name: getLabel(i, timeRange, points) }
    
    // Add cumulative earnings for each position
    lpPositions.forEach(position => {
      // Simulate gradual earnings growth with some variation
      const baseEarnings = position.earnings * progress
      const variation = Math.sin(i * 0.5) * (position.earnings * 0.05)
      point[position.tokenB] = Math.max(0, baseEarnings + variation)
    })
    
    data.push(point)
  }
  
  return data
}

function getLabel(index, timeRange, totalPoints) {
  if (timeRange === '1W') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days[index % 7]
  } else if (timeRange === '1M') {
    return `${index + 1}`
  } else if (timeRange === '3M') {
    const months = ['Oct', 'Nov', 'Dec']
    const week = Math.floor(index / 4)
    return months[week] || `W${index + 1}`
  } else {
    return `${index + 1}`
  }
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  
  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs">{entry.dataKey}</span>
            </div>
            <span className="text-xs font-medium">
              +${entry.value?.toFixed(2) || '0.00'}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-xs font-semibold text-green-500">
            +${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LpPortfolioChart({ lpPositions = [] }) {
  const [timeRange, setTimeRange] = useState('1M')
  
  const chartData = useMemo(() => 
    generateEarningsData(lpPositions, timeRange), 
    [lpPositions, timeRange]
  )
  
  const hasPositions = lpPositions.length > 0
  const totalEarnings = lpPositions.reduce((sum, p) => sum + p.earnings, 0)
  
  // Get unique token symbols for lines
  const tokenSymbols = lpPositions.map(p => p.tokenB)
  
  if (!hasPositions) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-[240px] text-muted-foreground">
          <p className="text-sm">Add liquidity to see your earnings over time</p>
        </div>
      </Card>
    )
  }
  
  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Earnings by Pool</h3>
          <p className="text-lg font-semibold text-green-500">
            +${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.key}
              variant={timeRange === range.key ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setTimeRange(range.key)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Line Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              hide={true}
              domain={[0, 'dataMax + 50']}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            {tokenSymbols.map((symbol) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={POOL_COLORS[symbol] || '#6b7280'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: POOL_COLORS[symbol] || '#6b7280' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 px-2">
        {tokenSymbols.map((symbol) => (
          <div key={symbol} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: POOL_COLORS[symbol] || '#6b7280' }}
            />
            <span className="text-xs text-muted-foreground">{symbol}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
