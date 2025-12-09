import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Wallet, ChevronRight, ExternalLink } from 'lucide-react'

// Mock connected wallets state - in real app this would come from wallet providers
const mockWalletState = {
  ethereum: {
    connected: true,
    address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    balances: {
      USDC: 1500.50,
      USDT: 850.25
    }
  },
  solana: {
    connected: false,
    address: null,
    balances: {
      USDC: 0,
      USDT: 0
    }
  }
}

// Chain configuration
const chains = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    color: '#627EEA',
    icon: 'E'
  },
  {
    id: 'solana', 
    name: 'Solana',
    color: '#9945FF',
    icon: 'S'
  }
]

// Supported stablecoins
const stablecoins = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    color: '#2775CA',
    icon: '$'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    color: '#26A17B',
    icon: 'T'
  }
]

function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function BridgeTokenDialog({ 
  open, 
  onOpenChange, 
  onSelectToken,
  connectedWallets = mockWalletState,
  onConnectWallet
}) {
  const [connectingChain, setConnectingChain] = useState(null)

  const handleConnectWallet = async (chainId) => {
    setConnectingChain(chainId)
    
    // Simulate wallet connection
    if (onConnectWallet) {
      await onConnectWallet(chainId)
    } else {
      // Mock connection delay
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    setConnectingChain(null)
  }

  const handleSelectToken = (chainId, tokenSymbol) => {
    const wallet = connectedWallets[chainId]
    if (!wallet?.connected) return

    const token = stablecoins.find(s => s.symbol === tokenSymbol)
    const chain = chains.find(c => c.id === chainId)
    
    onSelectToken({
      symbol: tokenSymbol,
      name: token.name,
      color: token.color,
      chain: chainId,
      chainName: chain.name,
      chainColor: chain.color,
      balance: wallet.balances[tokenSymbol] || 0,
      walletAddress: wallet.address
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Select Source Token</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a stablecoin from an external chain to convert to CNPY
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {chains.map((chain) => {
            const wallet = connectedWallets[chain.id]
            const isConnected = wallet?.connected
            const isConnecting = connectingChain === chain.id

            return (
              <div key={chain.id} className="space-y-2">
                {/* Chain Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: chain.color }}
                    >
                      {chain.icon}
                    </div>
                    <span className="font-semibold text-sm">{chain.name}</span>
                  </div>
                  
                  {/* Connection Status */}
                  {isConnected ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-medium">{formatAddress(wallet.address)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>

                {/* Token List or Connect Button */}
                {isConnected ? (
                  <Card className="bg-muted/30 divide-y divide-border/50">
                    {stablecoins.map((token) => {
                      const balance = wallet.balances[token.symbol] || 0
                      const hasBalance = balance > 0

                      return (
                        <button
                          key={token.symbol}
                          onClick={() => handleSelectToken(chain.id, token.symbol)}
                          disabled={!hasBalance}
                          className={`w-full p-3 flex items-center justify-between transition-colors ${
                            hasBalance 
                              ? 'hover:bg-muted/50 cursor-pointer' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ backgroundColor: token.color }}
                            >
                              {token.icon}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">{token.symbol}</p>
                              <p className="text-xs text-muted-foreground">{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-between"
                    onClick={() => handleConnectWallet(chain.id)}
                    disabled={isConnecting}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span>
                        {isConnecting ? 'Connecting...' : `Connect ${chain.name} Wallet`}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}

          {/* Info Note */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Bridge USDC or USDT from Ethereum or Solana to receive CNPY on Canopy Network
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

