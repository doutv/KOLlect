"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react"

type Opinion = {
  id: number
  name: string
  username: string
  avatar: string
  content: string
  isYes: boolean
  likes: number
  likeStake: number
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
}

type ProposalsContextType = {
  proposals: Proposal[]
  getProposal: (id: number) => Proposal | undefined
  addProposal: (proposal: Omit<Proposal, "id" | "lastUpdated" | "opinions">) => void
  addOpinion: (proposalId: number, opinion: Omit<Opinion, "id" | "likes" | "likeStake" | "timestamp">) => void
  loveOpinion: (proposalId: number, opinionId: number, stakeAmount: number) => void
  version: number
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined)

// Initial proposals data with fixed lastUpdated timestamps to avoid hydration mismatches
const initialProposals: Proposal[] = [
  {
    id: 1,
    title: "Increase stake requirement",
    description: "Increase stake requirement from 0.1 ETH to 0.5 ETH",
    proposedBy: "@Alice",
    timeLeft: "24h",
    totalStake: 0.5,
    yesPercentage: 60,
    noPercentage: 40,
    lastUpdated: 0, // Will be updated on client-side
    opinions: [
      {
        id: 1,
        name: "Bob",
        username: "@bob",
        avatar: "/placeholder-user.jpg",
        content: "I support this proposal because it will lead to more thoughtful participation.",
        isYes: true,
        likes: 10,
        likeStake: 0.5,
        timestamp: "2h ago",
      },
      {
        id: 2,
        name: "Carol",
        username: "@carol",
        avatar: "/placeholder-user.jpg",
        content: "I disagree. This might exclude smaller participants.",
        isYes: false,
        likes: 5,
        likeStake: 0.3,
        timestamp: "1h ago",
      },
    ],
  },
  {
    id: 2,
    title: "Implement quadratic voting",
    description: "Change the voting system to quadratic voting for more democratic results",
    proposedBy: "@Bob",
    timeLeft: "48h",
    totalStake: 1.2,
    yesPercentage: 75,
    noPercentage: 25,
    lastUpdated: 0, // Will be updated on client-side
    opinions: [
      {
        id: 1,
        name: "Alice",
        username: "@alice",
        avatar: "/placeholder-user.jpg",
        content: "Quadratic voting could lead to more balanced outcomes.",
        isYes: true,
        likes: 15,
        likeStake: 0.7,
        timestamp: "3h ago",
      },
    ],
  },
  // Add more proposals here...
]

type Action =
  | { type: "UPDATE_PROPOSALS" }
  | { type: "SET_PROPOSALS"; proposals: Proposal[] }
  | { type: "ADD_PROPOSAL"; proposal: Omit<Proposal, "id" | "lastUpdated" | "opinions"> }
  | { type: "ADD_OPINION"; proposalId: number; opinion: Omit<Opinion, "id" | "likes" | "likeStake" | "timestamp"> }
  | { type: "LOVE_OPINION"; proposalId: number; opinionId: number; stakeAmount: number }
  | { type: "INITIALIZE_CLIENT" }

function proposalsReducer(state: { proposals: Proposal[]; version: number; isInitialized: boolean }, action: Action) {
  switch (action.type) {
    case "INITIALIZE_CLIENT":
      if (state.isInitialized) return state;
      
      // Set initial timestamps on client-side only
      const initializedProposals = state.proposals.map((proposal, index) => ({
        ...proposal,
        lastUpdated: Date.now() - (index * 60000), // Stagger timestamps to avoid all being "new"
      }));
      
      return { 
        ...state, 
        proposals: initializedProposals, 
        isInitialized: true 
      };
      
    case "UPDATE_PROPOSALS":
      const updatedProposals = state.proposals.map((proposal) => {
        const yesChange = Math.floor(Math.random() * 5) - 2
        const noChange = Math.floor(Math.random() * 5) - 2
        const stakeChange = Math.random() * 0.1

        return {
          ...proposal,
          yesPercentage: Math.max(0, Math.min(100, proposal.yesPercentage + yesChange)),
          noPercentage: Math.max(0, Math.min(100, proposal.noPercentage + noChange)),
          totalStake: Number((proposal.totalStake + stakeChange).toFixed(2)),
          lastUpdated: Date.now(),
          opinions: proposal.opinions.map((opinion) => ({
            ...opinion,
            likes: Math.max(0, opinion.likes + Math.floor(Math.random() * 3) - 1),
            likeStake: Number((opinion.likeStake + Math.random() * 0.05).toFixed(2)),
          })),
        }
      })
      return { ...state, proposals: updatedProposals, version: state.version + 1 }
      
    case "SET_PROPOSALS":
      return { ...state, proposals: action.proposals, version: state.version + 1 }
      
    case "ADD_PROPOSAL":
      const newId = Math.max(0, ...state.proposals.map((p) => p.id)) + 1
      const newProposal: Proposal = {
        ...action.proposal,
        id: newId,
        lastUpdated: Date.now(),
        opinions: [],
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
            const newOpinionId = Math.max(0, ...proposal.opinions.map(o => o.id)) + 1
            const newOpinion: Opinion = {
              ...action.opinion,
              id: newOpinionId,
              likes: 0,
              likeStake: 0,
              timestamp: "Just now"
            }
            return {
              ...proposal,
              opinions: [...proposal.opinions, newOpinion],
              lastUpdated: Date.now()
            }
          }
          return proposal
        }),
        version: state.version + 1
      }
      
    case "LOVE_OPINION":
      return {
        ...state,
        proposals: state.proposals.map(proposal => {
          if (proposal.id === action.proposalId) {
            return {
              ...proposal,
              opinions: proposal.opinions.map(opinion => {
                if (opinion.id === action.opinionId) {
                  return {
                    ...opinion,
                    likes: opinion.likes + 1,
                    likeStake: Number((opinion.likeStake + action.stakeAmount).toFixed(2))
                  }
                }
                return opinion
              }),
              lastUpdated: Date.now()
            }
          }
          return proposal
        }),
        version: state.version + 1
      }
      
    default:
      return state
  }
}

export const ProposalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(proposalsReducer, { 
    proposals: initialProposals, 
    version: 0,
    isInitialized: false
  })
  
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once component is mounted on the client
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Initialize client-side data once mounted
  useEffect(() => {
    if (isClient) {
      dispatch({ type: "INITIALIZE_CLIENT" })
    }
  }, [isClient])

  const getProposal = useCallback((id: number) => state.proposals.find((p) => p.id === id), [state.proposals])

  const addProposal = useCallback((proposal: Omit<Proposal, "id" | "lastUpdated" | "opinions">) => {
    dispatch({ type: "ADD_PROPOSAL", proposal })
  }, [])
  
  const addOpinion = useCallback((proposalId: number, opinion: Omit<Opinion, "id" | "likes" | "likeStake" | "timestamp">) => {
    dispatch({ type: "ADD_OPINION", proposalId, opinion })
  }, [])
  
  const loveOpinion = useCallback((proposalId: number, opinionId: number, stakeAmount: number) => {
    dispatch({ type: "LOVE_OPINION", proposalId, opinionId, stakeAmount })
  }, [])

  useEffect(() => {
    // Only start the interval on the client side after initialization
    if (!isClient || !state.isInitialized) return

    const interval = setInterval(() => {
      dispatch({ type: "UPDATE_PROPOSALS" })
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [isClient, state.isInitialized])

  return (
    <ProposalsContext.Provider
      value={{
        proposals: state.proposals,
        getProposal,
        addProposal,
        addOpinion,
        loveOpinion,
        version: state.version,
      }}
    >
      {children}
    </ProposalsContext.Provider>
  )
}

export const useProposals = () => {
  const context = useContext(ProposalsContext)
  if (context === undefined) {
    throw new Error("useProposals must be used within a ProposalsProvider")
  }
  return context
}

