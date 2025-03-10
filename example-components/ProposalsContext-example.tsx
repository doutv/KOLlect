"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react"
import { useAccount, useContractRead, useContractWrite, usePublicClient, useWalletClient } from "wagmi"
import { parseEther } from "viem"
import { useWeb3 } from "./Web3Context"
import SymposiumABI from "../contracts/SymposiumABI.json"
import { contractAddresses } from "../contracts/config"

// Type definitions
type Opinion = {
  id: number
  name: string // Will be set as "Anonymous" 
  username: string // Will be set as "@user"
  avatar: string
  content: string
  isYes: boolean // Maps to vote in the contract
  likes: number // Maps to voteCount in the contract
  likeStake: number // Will be a calculated value based on votes
  timestamp: string
}

type Proposal = {
  id: number
  title: string
  description: string
  proposedBy: string
  timeLeft: string
  totalStake: number
  yesPercentage: number
  noPercentage: number
  lastUpdated: number
  opinions: Opinion[]
  isFinalized?: boolean
  yesWins?: boolean
  canClaim?: boolean
}

type ProposalsContextType = {
  proposals: Proposal[]
  getProposal: (id: number) => Proposal | undefined
  addProposal: (proposal: Omit<Proposal, "id" | "lastUpdated" | "opinions">) => void
  addOpinion: (proposalId: number, opinion: Omit<Opinion, "id" | "likes" | "likeStake" | "timestamp">) => void
  voteForOpinion: (proposalId: number, opinionId: number) => void
  finalizeProposal: (proposalId: number) => void
  claimReward: (proposalId: number) => void
  isLoading: boolean
  error: Error | null
  contractValue: string
  version: number
}

// Initial state
type State = {
  proposals: Proposal[]
  version: number
  isInitialized: boolean
  isLoading: boolean
  error: Error | null
}

const initialState: State = {
  proposals: [],
  version: 0,
  isInitialized: false,
  isLoading: false,
  error: null
}

// Create context
const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined)

// Action types
type Action =
  | { type: "SET_PROPOSALS"; proposals: Proposal[] }
  | { type: "ADD_PROPOSAL"; proposal: Omit<Proposal, "id" | "lastUpdated" | "opinions"> }
  | { type: "ADD_OPINION"; proposalId: number; opinion: Omit<Opinion, "id" | "likes" | "likeStake" | "timestamp"> }
  | { type: "UPDATE_PROPOSAL"; proposal: Partial<Proposal> & { id: number } }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: Error | null }
  | { type: "INCREMENT_VERSION" }

// Reducer function
function proposalsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PROPOSALS":
      return { 
        ...state, 
        proposals: action.proposals,
        version: state.version + 1
      }
    
    case "ADD_PROPOSAL":
      // Note: This is optimistic UI update. The actual ID will come from the blockchain event
      const newId = Math.max(0, ...state.proposals.map((p) => p.id)) + 1
      const newProposal: Proposal = {
        ...action.proposal,
        id: newId,
        lastUpdated: Date.now(),
        opinions: [],
        totalStake: 0,
        yesPercentage: 0,
        noPercentage: 0
      }
      return {
        ...state,
        proposals: [newProposal, ...state.proposals],
        version: state.version + 1,
      }
    
    case "ADD_OPINION":
      return {
        ...state,
        proposals: state.proposals.map(proposal => {
          if (proposal.id === action.proposalId) {
            // This is optimistic UI update. The actual data will be updated from events
            const newOpinionId = proposal.opinions.length
            const newOpinion: Opinion = {
              ...action.opinion,
              id: newOpinionId,
              likes: 1, // Initial vote is from the creator
              likeStake: 0.1, // Initial stake is 0.1 ETH
              timestamp: "Just now"
            }
            return {
              ...proposal,
              opinions: [...proposal.opinions, newOpinion],
              lastUpdated: Date.now(),
              // Update vote percentages
              ...(action.opinion.isYes 
                ? { 
                    yesPercentage: Math.round((proposal.totalStake + 0.1) / (proposal.totalStake + 0.1) * 100), 
                    totalStake: proposal.totalStake + 0.1 
                  }
                : { 
                    noPercentage: Math.round((proposal.totalStake + 0.1) / (proposal.totalStake + 0.1) * 100),
                    totalStake: proposal.totalStake + 0.1
                  }
              )
            }
          }
          return proposal
        }),
        version: state.version + 1
      }
    
    case "UPDATE_PROPOSAL":
      return {
        ...state,
        proposals: state.proposals.map(proposal => 
          proposal.id === action.proposal.id 
            ? { ...proposal, ...action.proposal, lastUpdated: Date.now() }
            : proposal
        ),
        version: state.version + 1
      }
    
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading
      }
    
    case "SET_ERROR":
      return {
        ...state,
        error: action.error
      }
    
    case "INCREMENT_VERSION":
      return {
        ...state,
        version: state.version + 1
      }
      
    default:
      return state
  }
}

// Provider component
export const ProposalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, chainId } = useWeb3()
  const { address } = useAccount()
  const [state, dispatch] = useReducer(proposalsReducer, initialState)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  // Get the contract address based on the current network
  const contractAddress = chainId && contractAddresses[chainId]
    ? contractAddresses[chainId]
    : undefined

  // Define contract value (for voting)
  const contractValue = "0.1" // 0.1 ETH

  // Effects for loading data
  useEffect(() => {
    if (!isConnected || !contractAddress || !publicClient) return
    
    const loadProposals = async () => {
      dispatch({ type: "SET_LOADING", isLoading: true })
      try {
        // Get proposal count
        const proposalCount = await publicClient.readContract({
          address: contractAddress,
          abi: SymposiumABI,
          functionName: 'proposalCount'
        }) as bigint
        
        // Initialize array to hold proposals
        const proposals: Proposal[] = []
        
        // Loop through all proposals
        for (let i = 1; i <= Number(proposalCount); i++) {
          try {
            // Get basic proposal info
            const proposalInfo = await publicClient.readContract({
              address: contractAddress,
              abi: SymposiumABI,
              functionName: 'proposals',
              args: [i]
            }) as any
            
            // Get opinions count (we'd need to implement this via events or a custom view function)
            // For this example, we'll simulate it
            const opinionsCount = 3 // This would come from the contract
            
            // Initialize array to hold opinions
            const opinions: Opinion[] = []
            
            // Loop through all opinions
            for (let j = 0; j < opinionsCount; j++) {
              // In a real implementation, we would fetch opinion details from the contract
              // For this example, we'll create mock data based on what we know about the contract
              opinions.push({
                id: j,
                name: "Anonymous",
                username: "@user",
                avatar: "/placeholder-user.jpg",
                content: j === 0 ? "This is a great idea!" : "I'm not sure about this.",
                isYes: j === 0, // First opinion is Yes, others are No
                likes: j === 0 ? 2 : 1, // Number of votes
                likeStake: j === 0 ? 0.2 : 0.1, // Total stake
                timestamp: "2h ago"
              })
            }
            
            // Calculate percentages
            const totalYesVotes = opinions.reduce((acc, op) => acc + (op.isYes ? op.likes : 0), 0)
            const totalNoVotes = opinions.reduce((acc, op) => acc + (!op.isYes ? op.likes : 0), 0)
            const totalVotes = totalYesVotes + totalNoVotes
            
            const yesPercentage = totalVotes > 0 ? Math.round((totalYesVotes / totalVotes) * 100) : 0
            const noPercentage = totalVotes > 0 ? Math.round((totalNoVotes / totalVotes) * 100) : 0
            
            // Create proposal object
            proposals.push({
              id: i,
              title: proposalInfo.title,
              description: proposalInfo.details,
              proposedBy: `@user${i}`, // We don't have this info in the contract
              timeLeft: calculateTimeLeft(Number(proposalInfo.expireTime)), // Calculate time left
              totalStake: (totalVotes * 0.1), // Each vote costs 0.1 ETH
              yesPercentage,
              noPercentage,
              opinions,
              lastUpdated: Date.now(),
              isFinalized: proposalInfo.isFinalized,
              yesWins: proposalInfo.yesWins,
              canClaim: address ? canClaimReward(i, address) : false // Would need to check if user can claim
            })
          } catch (error) {
            console.error(`Error loading proposal ${i}:`, error)
          }
        }
        
        dispatch({ type: "SET_PROPOSALS", proposals })
      } catch (error) {
        console.error("Error loading proposals:", error)
        dispatch({ type: "SET_ERROR", error: error as Error })
      } finally {
        dispatch({ type: "SET_LOADING", isLoading: false })
      }
    }
    
    loadProposals()
    
    // Setup event listeners
    const setupEventListeners = () => {
      // ProposalCreated event
      publicClient.watchContractEvent({
        address: contractAddress,
        abi: SymposiumABI,
        eventName: 'ProposalCreated',
        onLogs: (logs) => {
          // Handle proposal created event
          dispatch({ type: "INCREMENT_VERSION" })
          // In a real implementation, we would reload all proposals or update the specific one
        }
      })
      
      // OpinionCreated event
      publicClient.watchContractEvent({
        address: contractAddress,
        abi: SymposiumABI,
        eventName: 'OpinionCreated',
        onLogs: (logs) => {
          // Handle opinion created event
          dispatch({ type: "INCREMENT_VERSION" })
        }
      })
      
      // VoteCast event
      publicClient.watchContractEvent({
        address: contractAddress,
        abi: SymposiumABI,
        eventName: 'VoteCast',
        onLogs: (logs) => {
          // Handle vote cast event
          dispatch({ type: "INCREMENT_VERSION" })
        }
      })
      
      // ProposalFinalized event
      publicClient.watchContractEvent({
        address: contractAddress,
        abi: SymposiumABI,
        eventName: 'ProposalFinalized',
        onLogs: (logs) => {
          // Handle proposal finalized event
          dispatch({ type: "INCREMENT_VERSION" })
        }
      })
      
      // RewardClaimed event
      publicClient.watchContractEvent({
        address: contractAddress,
        abi: SymposiumABI,
        eventName: 'RewardClaimed',
        onLogs: (logs) => {
          // Handle reward claimed event
          dispatch({ type: "INCREMENT_VERSION" })
        }
      })
    }
    
    setupEventListeners()
    
  }, [isConnected, contractAddress, publicClient, address])
  
  // Helper function to calculate time left
  const calculateTimeLeft = (expireTime: number): string => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = expireTime - now
    
    if (timeLeft <= 0) return "Expired"
    
    const days = Math.floor(timeLeft / 86400)
    const hours = Math.floor((timeLeft % 86400) / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)
    
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
  }
  
  // Helper function to check if user can claim rewards
  const canClaimReward = (proposalId: number, userAddress: string): boolean => {
    // In a real implementation, we would check if the user has already claimed or is eligible
    // For this example, we'll return true if the proposal is finalized
    const proposal = state.proposals.find(p => p.id === proposalId)
    return proposal?.isFinalized ?? false
  }
  
  // Contract interaction functions
  const addProposal = useCallback(async (proposal: Omit<Proposal, "id" | "lastUpdated" | "opinions">) => {
    if (!isConnected || !contractAddress || !walletClient) {
      dispatch({ type: "SET_ERROR", error: new Error("Wallet not connected") })
      return
    }
    
    try {
      dispatch({ type: "SET_LOADING", isLoading: true })
      
      // Optimistically update UI
      dispatch({ type: "ADD_PROPOSAL", proposal })
      
      // Calculate duration in seconds
      const durationMatch = proposal.timeLeft.match(/^(\d+)([hd])$/)
      let durationInSeconds = 86400 // Default to 1 day
      
      if (durationMatch) {
        const [, value, unit] = durationMatch
        durationInSeconds = parseInt(value) * (unit === 'h' ? 3600 : 86400)
      }
      
      // Send transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SymposiumABI,
        functionName: 'createProposal',
        args: [proposal.title, proposal.description, BigInt(durationInSeconds)]
      })
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      // In a production app, we would update the state based on the emitted event
      // For this example, we rely on the event listeners to update the state
      
    } catch (error) {
      console.error("Error creating proposal:", error)
      dispatch({ type: "SET_ERROR", error: error as Error })
      
      // TODO: Revert optimistic update
      
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false })
    }
  }, [isConnected, contractAddress, walletClient, publicClient])
  
  const addOpinion = useCallback(async (proposalId: number, opinion: Omit<Opinion, "id" | "likes" | "likeStake" | "timestamp">) => {
    if (!isConnected || !contractAddress || !walletClient) {
      dispatch({ type: "SET_ERROR", error: new Error("Wallet not connected") })
      return
    }
    
    try {
      dispatch({ type: "SET_LOADING", isLoading: true })
      
      // Optimistically update UI
      dispatch({ type: "ADD_OPINION", proposalId, opinion })
      
      // Send transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SymposiumABI,
        functionName: 'createOpinion',
        args: [BigInt(proposalId), opinion.isYes, opinion.content],
        value: parseEther("0.1")
      })
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
    } catch (error) {
      console.error("Error creating opinion:", error)
      dispatch({ type: "SET_ERROR", error: error as Error })
      
      // TODO: Revert optimistic update
      
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false })
    }
  }, [isConnected, contractAddress, walletClient, publicClient])
  
  const voteForOpinion = useCallback(async (proposalId: number, opinionId: number) => {
    if (!isConnected || !contractAddress || !walletClient) {
      dispatch({ type: "SET_ERROR", error: new Error("Wallet not connected") })
      return
    }
    
    try {
      dispatch({ type: "SET_LOADING", isLoading: true })
      
      // Optimistically update UI
      const proposal = state.proposals.find(p => p.id === proposalId)
      if (proposal) {
        const opinion = proposal.opinions.find(o => o.id === opinionId)
        if (opinion) {
          dispatch({
            type: "UPDATE_PROPOSAL",
            proposal: {
              id: proposalId,
              opinions: proposal.opinions.map(o => 
                o.id === opinionId 
                  ? { ...o, likes: o.likes + 1, likeStake: o.likeStake + 0.1 }
                  : o
              ),
              totalStake: proposal.totalStake + 0.1,
              yesPercentage: opinion.isYes 
                ? Math.round(((proposal.yesPercentage / 100 * proposal.totalStake) + 0.1) / (proposal.totalStake + 0.1) * 100)
                : Math.round((proposal.yesPercentage / 100 * proposal.totalStake) / (proposal.totalStake + 0.1) * 100),
              noPercentage: !opinion.isYes
                ? Math.round(((proposal.noPercentage / 100 * proposal.totalStake) + 0.1) / (proposal.totalStake + 0.1) * 100)
                : Math.round((proposal.noPercentage / 100 * proposal.totalStake) / (proposal.totalStake + 0.1) * 100)
            }
          })
        }
      }
      
      // Send transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SymposiumABI,
        functionName: 'voteForOpinion',
        args: [BigInt(proposalId), BigInt(opinionId)],
        value: parseEther("0.1")
      })
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
    } catch (error) {
      console.error("Error voting for opinion:", error)
      dispatch({ type: "SET_ERROR", error: error as Error })
      
      // TODO: Revert optimistic update
      
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false })
    }
  }, [isConnected, contractAddress, walletClient, publicClient, state.proposals])
  
  const finalizeProposal = useCallback(async (proposalId: number) => {
    if (!isConnected || !contractAddress || !walletClient) {
      dispatch({ type: "SET_ERROR", error: new Error("Wallet not connected") })
      return
    }
    
    try {
      dispatch({ type: "SET_LOADING", isLoading: true })
      
      // Optimistically update UI
      dispatch({
        type: "UPDATE_PROPOSAL",
        proposal: {
          id: proposalId,
          isFinalized: true,
          // We don't know the outcome yet, so we'll wait for the event
        }
      })
      
      // Send transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SymposiumABI,
        functionName: 'finalizeProposal',
        args: [BigInt(proposalId)]
      })
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
    } catch (error) {
      console.error("Error finalizing proposal:", error)
      dispatch({ type: "SET_ERROR", error: error as Error })
      
      // TODO: Revert optimistic update
      
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false })
    }
  }, [isConnected, contractAddress, walletClient, publicClient])
  
  const claimReward = useCallback(async (proposalId: number) => {
    if (!isConnected || !contractAddress || !walletClient) {
      dispatch({ type: "SET_ERROR", error: new Error("Wallet not connected") })
      return
    }
    
    try {
      dispatch({ type: "SET_LOADING", isLoading: true })
      
      // We don't update UI optimistically for this action
      
      // Send transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SymposiumABI,
        functionName: 'claimReward',
        args: [BigInt(proposalId)]
      })
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      // Update UI based on successful claim
      dispatch({
        type: "UPDATE_PROPOSAL",
        proposal: {
          id: proposalId,
          canClaim: false
        }
      })
      
    } catch (error) {
      console.error("Error claiming reward:", error)
      dispatch({ type: "SET_ERROR", error: error as Error })
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false })
    }
  }, [isConnected, contractAddress, walletClient, publicClient])
  
  // Get a single proposal by ID
  const getProposal = useCallback((id: number) => {
    return state.proposals.find((p) => p.id === id)
  }, [state.proposals])
  
  // Context value
  const value: ProposalsContextType = {
    proposals: state.proposals,
    getProposal,
    addProposal,
    addOpinion,
    voteForOpinion,
    finalizeProposal,
    claimReward,
    isLoading: state.isLoading,
    error: state.error,
    contractValue,
    version: state.version
  }
  
  return (
    <ProposalsContext.Provider value={value}>
      {children}
    </ProposalsContext.Provider>
  )
}

// Hook for using the context
export const useProposals = () => {
  const context = useContext(ProposalsContext)
  if (context === undefined) {
    throw new Error("useProposals must be used within a ProposalsProvider")
  }
  return context
} 