import { useEffect, useState, useCallback } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { useWeb3 } from '@/contexts/Web3Context'
import * as symposiumService from '@/lib/blockchain/symposium'

export function useSymposium() {
  const { isConnected, chainId } = useWeb3()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>(undefined)
  const [isContractAvailable, setIsContractAvailable] = useState(false)

  // Update contract address when chainId changes
  useEffect(() => {
    const address = symposiumService.getContractAddress(chainId)
    setContractAddress(address)
    setIsContractAvailable(!!address && isConnected)
  }, [chainId, isConnected])

  // Read functions
  const getProposalCount = useCallback(async () => {
    if (!isContractAvailable || !contractAddress || !publicClient) {
      throw new Error('Contract or client not available')
    }
    return symposiumService.getProposalCount(publicClient, contractAddress)
  }, [isContractAvailable, contractAddress, publicClient])

  const getProposal = useCallback(
    async (proposalId: bigint) => {
      if (!isContractAvailable || !contractAddress || !publicClient) {
        throw new Error('Contract or client not available')
      }
      return symposiumService.getProposal(publicClient, contractAddress, proposalId)
    },
    [isContractAvailable, contractAddress, publicClient]
  )

  const getVoteCost = useCallback(async () => {
    if (!isContractAvailable || !contractAddress || !publicClient) {
      throw new Error('Contract or client not available')
    }
    return symposiumService.getVoteCost(publicClient, contractAddress)
  }, [isContractAvailable, contractAddress, publicClient])

  // Write functions
  const createProposal = useCallback(
    async (title: string, details: string, duration: bigint) => {
      if (!isContractAvailable || !contractAddress || !walletClient) {
        throw new Error('Contract or wallet not available')
      }
      const params: symposiumService.CreateProposalParams = {
        title,
        details,
        duration,
      }
      const hash = await symposiumService.createProposal(walletClient, contractAddress, params)
      return {
        hash,
        confirmTransaction: async () => {
          if (!publicClient) throw new Error('Public client not available')
          return publicClient.waitForTransactionReceipt({ hash })
        },
      }
    },
    [isContractAvailable, contractAddress, walletClient, publicClient]
  )

  const createOpinion = useCallback(
    async (proposalId: bigint, vote: boolean, reasoning: string) => {
      if (!isContractAvailable || !contractAddress || !walletClient) {
        throw new Error('Contract or wallet not available')
      }
      const params: symposiumService.CreateOpinionParams = {
        proposalId,
        vote,
        reasoning,
      }
      const hash = await symposiumService.createOpinion(walletClient, contractAddress, params)
      return {
        hash,
        confirmTransaction: async () => {
          if (!publicClient) throw new Error('Public client not available')
          return publicClient.waitForTransactionReceipt({ hash })
        },
      }
    },
    [isContractAvailable, contractAddress, walletClient, publicClient]
  )

  const voteForOpinion = useCallback(
    async (proposalId: bigint, opinionIndex: bigint) => {
      if (!isContractAvailable || !contractAddress || !walletClient) {
        throw new Error('Contract or wallet not available')
      }
      const params: symposiumService.VoteForOpinionParams = {
        proposalId,
        opinionIndex,
      }
      const hash = await symposiumService.voteForOpinion(walletClient, contractAddress, params)
      return {
        hash,
        confirmTransaction: async () => {
          if (!publicClient) throw new Error('Public client not available')
          return publicClient.waitForTransactionReceipt({ hash })
        },
      }
    },
    [isContractAvailable, contractAddress, walletClient, publicClient]
  )

  const finalizeProposal = useCallback(
    async (proposalId: bigint) => {
      if (!isContractAvailable || !contractAddress || !walletClient) {
        throw new Error('Contract or wallet not available')
      }
      const hash = await symposiumService.finalizeProposal(walletClient, contractAddress, proposalId)
      return {
        hash,
        confirmTransaction: async () => {
          if (!publicClient) throw new Error('Public client not available')
          return publicClient.waitForTransactionReceipt({ hash })
        },
      }
    },
    [isContractAvailable, contractAddress, walletClient, publicClient]
  )

  const claimReward = useCallback(
    async (proposalId: bigint) => {
      if (!isContractAvailable || !contractAddress || !walletClient) {
        throw new Error('Contract or wallet not available')
      }
      const hash = await symposiumService.claimReward(walletClient, contractAddress, proposalId)
      return {
        hash,
        confirmTransaction: async () => {
          if (!publicClient) throw new Error('Public client not available')
          return publicClient.waitForTransactionReceipt({ hash })
        },
      }
    },
    [isContractAvailable, contractAddress, walletClient, publicClient]
  )

  // Setup event listeners
  const setupEventListeners = useCallback(
    (handlers: {
      onProposalCreated?: (event: any) => void
      onOpinionCreated?: (event: any) => void
      onVoteCast?: (event: any) => void
      onProposalFinalized?: (event: any) => void
      onRewardClaimed?: (event: any) => void
    }) => {
      if (!isContractAvailable || !contractAddress || !publicClient) {
        return () => {}
      }

      const unwatch: (() => void)[] = []

      if (handlers.onProposalCreated) {
        const unwatchProposalCreated = publicClient.watchContractEvent({
          address: contractAddress,
          abi: symposiumService.SymposiumABI,
          eventName: 'ProposalCreated',
          onLogs: handlers.onProposalCreated,
        })
        unwatch.push(unwatchProposalCreated)
      }

      if (handlers.onOpinionCreated) {
        const unwatchOpinionCreated = publicClient.watchContractEvent({
          address: contractAddress,
          abi: symposiumService.SymposiumABI,
          eventName: 'OpinionCreated',
          onLogs: handlers.onOpinionCreated,
        })
        unwatch.push(unwatchOpinionCreated)
      }

      if (handlers.onVoteCast) {
        const unwatchVoteCast = publicClient.watchContractEvent({
          address: contractAddress,
          abi: symposiumService.SymposiumABI,
          eventName: 'VoteCast',
          onLogs: handlers.onVoteCast,
        })
        unwatch.push(unwatchVoteCast)
      }

      if (handlers.onProposalFinalized) {
        const unwatchProposalFinalized = publicClient.watchContractEvent({
          address: contractAddress,
          abi: symposiumService.SymposiumABI,
          eventName: 'ProposalFinalized',
          onLogs: handlers.onProposalFinalized,
        })
        unwatch.push(unwatchProposalFinalized)
      }

      if (handlers.onRewardClaimed) {
        const unwatchRewardClaimed = publicClient.watchContractEvent({
          address: contractAddress,
          abi: symposiumService.SymposiumABI,
          eventName: 'RewardClaimed',
          onLogs: handlers.onRewardClaimed,
        })
        unwatch.push(unwatchRewardClaimed)
      }

      // Return cleanup function
      return () => {
        unwatch.forEach((unwatchFn) => unwatchFn())
      }
    },
    [isContractAvailable, contractAddress, publicClient]
  )

  return {
    isContractAvailable,
    contractAddress,
    // Read functions
    getProposalCount,
    getProposal,
    getVoteCost,
    // Write functions
    createProposal,
    createOpinion,
    voteForOpinion,
    finalizeProposal,
    claimReward,
    // Event listeners
    setupEventListeners,
  }
} 