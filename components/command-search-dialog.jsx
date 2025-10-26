import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Search, Clock, Link as LinkChain, Activity, Box } from 'lucide-react'
import { getAllChains, getChainById } from '@/data/db'
import transactionsData from '@/data/transactions.json'
import blocksData from '@/data/blocks.json'

const RECENT_SEARCHES_KEY = 'canopy_recent_searches'
const MAX_RECENT_SEARCHES = 5

export default function CommandSearchDialog({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const [allChains, setAllChains] = useState([])
  const [filteredChains, setFilteredChains] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [filteredBlocks, setFilteredBlocks] = useState([])

  // Load chains and recent searches on mount
  useEffect(() => {
    const chains = getAllChains()
    setAllChains(chains)
    loadRecentSearches()

    // Add fake recent searches if none exist (for demo purposes)
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!stored && chains.length > 0) {
      const fakeRecents = [
        {
          type: 'chain',
          id: chains[0]?.id,
          name: chains[0]?.name,
          ticker: chains[0]?.ticker,
          brandColor: chains[0]?.brandColor,
          url: chains[0]?.url,
        },
      ]

      // Add a real transaction if available
      if (transactionsData.length > 0) {
        const firstTx = transactionsData[0]
        const txChain = chains.find(c => c.id === firstTx.chainId)
        if (txChain) {
          fakeRecents.push({
            type: 'transaction',
            id: firstTx.hash,
            name: firstTx.hash,
            chainId: firstTx.chainId,
            chainName: txChain.name,
          })
        }
      }

      // Add second chain
      if (chains[1]) {
        fakeRecents.push({
          type: 'chain',
          id: chains[1]?.id,
          name: chains[1]?.name,
          ticker: chains[1]?.ticker,
          brandColor: chains[1]?.brandColor,
          url: chains[1]?.url,
        })
      }

      // Add a real block if available
      if (blocksData.length > 0) {
        const firstBlock = blocksData[0]
        const blockChain = chains.find(c => c.id === firstBlock.chainId)
        if (blockChain) {
          fakeRecents.push({
            type: 'block',
            id: firstBlock.hash,
            name: `Block #${firstBlock.number}`,
            chainId: firstBlock.chainId,
            chainName: blockChain.name,
          })
        }
      }

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(fakeRecents))
      setRecentSearches(fakeRecents)
    }
  }, [])

  // Filter chains, transactions, and blocks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChains([])
      setFilteredTransactions([])
      setFilteredBlocks([])
      return
    }

    const query = searchQuery.toLowerCase()

    // Filter chains
    const chainResults = allChains.filter(
      (chain) =>
        !chain.isDraft && (
          chain.name.toLowerCase().includes(query) ||
          chain.ticker.toLowerCase().includes(query)
        )
    ).slice(0, 5) // Limit to top 5 results

    // Filter transactions by hash
    const txResults = transactionsData.filter(
      (tx) => tx.hash.toLowerCase().includes(query)
    ).slice(0, 5)

    // Filter blocks by number or hash
    const blockResults = blocksData.filter(
      (block) =>
        block.number.toString().includes(query) ||
        block.hash.toLowerCase().includes(query)
    ).slice(0, 5)

    setFilteredChains(chainResults)
    setFilteredTransactions(txResults)
    setFilteredBlocks(blockResults)
  }, [searchQuery, allChains])

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }

  const saveToRecentSearches = (item) => {
    try {
      const existingIndex = recentSearches.findIndex(
        (search) => search.type === item.type && search.id === item.id
      )

      let updated = [...recentSearches]

      // If item already exists, remove it to re-add at the top
      if (existingIndex !== -1) {
        updated.splice(existingIndex, 1)
      }

      // Add to the beginning
      updated.unshift(item)

      // Keep only MAX_RECENT_SEARCHES
      updated = updated.slice(0, MAX_RECENT_SEARCHES)

      setRecentSearches(updated)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save recent search:', error)
    }
  }

  const handleChainSelect = (chain) => {
    saveToRecentSearches({
      type: 'chain',
      id: chain.id,
      name: chain.name,
      ticker: chain.ticker,
      brandColor: chain.brandColor,
      url: chain.url,
    })
    navigate(chain.url)
    onOpenChange(false)
    setSearchQuery('')
  }

  const handleTransactionSelect = (tx) => {
    // Navigate to the transaction detail page
    const chain = getChainById(tx.chainId)
    if (chain) {
      saveToRecentSearches({
        type: 'transaction',
        id: tx.hash,
        name: tx.hash,
        chainId: tx.chainId,
        chainName: chain.name,
      })
      navigate(`/transaction/${tx.hash}`)
      onOpenChange(false)
      setSearchQuery('')
    }
  }

  const handleBlockSelect = (block) => {
    // Navigate to the block detail page
    const chain = getChainById(block.chainId)
    if (chain) {
      saveToRecentSearches({
        type: 'block',
        id: block.hash,
        name: `Block #${block.number}`,
        chainId: block.chainId,
        chainName: chain.name,
      })
      navigate(`/block/${block.hash}`)
      onOpenChange(false)
      setSearchQuery('')
    }
  }

  const handleRecentSelect = (recent) => {
    if (recent.type === 'chain') {
      navigate(recent.url)
      onOpenChange(false)
      setSearchQuery('')
    } else if (recent.type === 'transaction') {
      navigate(`/transaction/${recent.id}`)
      onOpenChange(false)
      setSearchQuery('')
    } else if (recent.type === 'block') {
      navigate(`/block/${recent.id}`)
      onOpenChange(false)
      setSearchQuery('')
    }
  }

  const getRecentIcon = (type) => {
    switch (type) {
      case 'chain':
        return LinkChain
      case 'transaction':
        return Activity
      case 'block':
        return Box
      default:
        return Search
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search chains, transactions, or blocks..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {searchQuery && filteredChains.length === 0 && filteredTransactions.length === 0 && filteredBlocks.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent searches">
              {recentSearches.map((recent, index) => {
                const IconComponent = getRecentIcon(recent.type)
                return (
                  <CommandItem
                    key={`${recent.type}-${recent.id}-${index}`}
                    onSelect={() => handleRecentSelect(recent)}
                    className="flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {recent.type === 'chain' && recent.brandColor && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: recent.brandColor }}
                      >
                        <span className="text-xs font-bold text-black">
                          {recent.ticker?.[0] || recent.name[0]}
                        </span>
                      </div>
                    )}
                    {recent.type !== 'chain' && <IconComponent className="w-4 h-4" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">
                        {recent.type === 'transaction' ? recent.name.slice(0, 10) + '...' : recent.name}
                      </p>
                      {recent.ticker && (
                        <p className="text-xs text-muted-foreground">${recent.ticker}</p>
                      )}
                      {recent.chainName && (
                        <p className="text-xs text-muted-foreground">{recent.chainName}</p>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Chain Results */}
        {searchQuery && filteredChains.length > 0 && (
          <CommandGroup heading="Chains">
            {filteredChains.map((chain) => (
              <CommandItem
                key={chain.id}
                onSelect={() => handleChainSelect(chain)}
                className="flex items-center gap-3"
              >
                {/* Chain Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: chain.brandColor || '#10b981' }}
                >
                  {chain.logo ? (
                    <img
                      src={chain.logo}
                      alt={chain.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-black">
                      {chain.ticker[0]}
                    </span>
                  )}
                </div>

                {/* Chain Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chain.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">${chain.ticker}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      ${(chain.marketCap / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>

                {/* Change Indicator */}
                {chain.priceChange24h !== 0 && (
                  <span className={`text-xs font-semibold ${chain.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {chain.priceChange24h >= 0 ? '+' : ''}{chain.priceChange24h}%
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Transaction Results */}
        {searchQuery && filteredTransactions.length > 0 && (
          <CommandGroup heading="Transactions">
            {filteredTransactions.map((tx) => (
              <CommandItem
                key={tx.hash}
                onSelect={() => handleTransactionSelect(tx)}
                className="flex items-center gap-3"
              >
                <Activity className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{tx.hash}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {tx.amount.toLocaleString()} {tx.ticker || 'tokens'}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Block #{tx.blockNumber}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Block Results */}
        {searchQuery && filteredBlocks.length > 0 && (
          <CommandGroup heading="Blocks">
            {filteredBlocks.map((block) => (
              <CommandItem
                key={block.hash}
                onSelect={() => handleBlockSelect(block)}
                className="flex items-center gap-3"
              >
                <Box className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Block #{block.number.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {block.transactions} transactions
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      {block.hash.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
