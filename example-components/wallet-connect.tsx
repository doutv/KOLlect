"use client"

import { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Wallet, AlertTriangle, ExternalLink, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WalletConnect() {
  const { isConnected, address, chainId, connect, disconnect, isCorrectNetwork, requiredChainId, switchNetwork, isLoading, error } = useWeb3()
  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false)

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Handle connect click
  const handleConnectClick = () => {
    connect()
  }

  // Handle disconnect click
  const handleDisconnectClick = () => {
    disconnect()
  }

  // Handle switch network
  const handleSwitchNetwork = () => {
    switchNetwork(requiredChainId)
    setIsNetworkDialogOpen(false)
  }

  // Check if we need to show network warning
  const showNetworkWarning = isConnected && !isCorrectNetwork

  // Show network warning dialog
  useEffect(() => {
    if (showNetworkWarning) {
      setIsNetworkDialogOpen(true)
    } else {
      setIsNetworkDialogOpen(false)
    }
  }, [showNetworkWarning])

  // Map chain ID to network name
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
      case 11155111:
        return 'Sepolia Testnet'
      default:
        return `Unknown Network (${chainId})`
    }
  }

  // Required network name
  const requiredNetworkName = getNetworkName(requiredChainId)

  // Current network name
  const currentNetworkName = chainId ? getNetworkName(chainId) : 'Not Connected'

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnectClick} 
        disabled={isLoading}
        className={cn("flex items-center", isLoading && "opacity-70")}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  // If connected but wrong network
  if (showNetworkWarning) {
    return (
      <>
        <Button 
          variant="destructive" 
          onClick={() => setIsNetworkDialogOpen(true)}
          className="flex items-center"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Wrong Network
        </Button>

        <Dialog open={isNetworkDialogOpen} onOpenChange={setIsNetworkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Network Switch Required</DialogTitle>
              <DialogDescription>
                This application requires {requiredNetworkName}. You are currently connected to {currentNetworkName}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex items-center justify-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNetworkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSwitchNetwork}>
                Switch to {requiredNetworkName}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // If connected to correct network
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
          {address && formatAddress(address)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="end">
        <div className="p-4 border-b">
          <p className="font-medium">Connected to {currentNetworkName}</p>
          <p className="text-sm text-gray-500 truncate">{address}</p>
        </div>
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left" 
            onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDisconnectClick}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 