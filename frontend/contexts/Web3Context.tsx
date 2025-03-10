"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { createConfig, configureChains } from 'wagmi'
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { WagmiConfig } from 'wagmi'
import { sonicTestnet } from '@/contracts/config'

// Define the supported chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sonicTestnet],
  [
    // Use Alchemy provider if API key is provided, otherwise fall back to public provider
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '' }),
    publicProvider(),
  ],
)

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

// Define the Web3 context type
interface Web3ContextType {
  isConnected: boolean
  address: string | undefined
  chainId: number | undefined
  connect: () => void
  disconnect: () => void
  switchNetwork: (chainId: number) => void
  isCorrectNetwork: boolean
  requiredChainId: number
  isLoading: boolean
  error: Error | null
}

// Create the context
const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Inner provider that uses wagmi hooks
const Web3ContextProvider = ({ children }: { children: ReactNode }) => {
  // Required chain ID (Sepolia testnet by default for development)
  const requiredChainId = process.env.NEXT_PUBLIC_REQUIRED_CHAIN_ID 
    ? parseInt(process.env.NEXT_PUBLIC_REQUIRED_CHAIN_ID) 
    : 11155111 // Default to Sepolia Testnet

  // Use wagmi hooks
  const { isConnected, address } = useAccount()
  const { connect, connectors, isLoading: isConnectLoading, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { switchNetwork: wagmiSwitchNetwork, isLoading: isSwitchingNetwork, error: switchNetworkError } = useSwitchNetwork()

  // Combine loading states
  const isLoading = isConnectLoading || isSwitchingNetwork

  // Combine errors
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (connectError || switchNetworkError) {
      setError(connectError || switchNetworkError)
    } else {
      setError(null)
    }
  }, [connectError, switchNetworkError])

  // Check if connected to the correct network
  const isCorrectNetwork = chain?.id === requiredChainId

  // Connect wallet function
  const handleConnect = useCallback(() => {
    // Find the MetaMask connector
    const injectedConnector = connectors.find(c => c.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }, [connect, connectors])

  // Switch network function
  const handleSwitchNetwork = useCallback((chainId: number) => {
    if (wagmiSwitchNetwork) {
      wagmiSwitchNetwork(chainId)
    }
  }, [wagmiSwitchNetwork])

  // Context value
  const value: Web3ContextType = {
    isConnected,
    address,
    chainId: chain?.id,
    connect: handleConnect,
    disconnect,
    switchNetwork: handleSwitchNetwork,
    isCorrectNetwork,
    requiredChainId,
    isLoading,
    error,
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

// Export the provider with WagmiConfig
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <Web3ContextProvider>
        {children}
      </Web3ContextProvider>
    </WagmiConfig>
  )
}

// Custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
} 