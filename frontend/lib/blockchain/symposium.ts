import { parseEther } from 'viem'
import SymposiumABI from '@/contracts/SymposiumABI.json'
import { contractAddresses, VOTE_COST } from '@/contracts/config'

// Export the ABI for use in other parts of the application
export { default as SymposiumABI } from '@/contracts/SymposiumABI.json'

// Helper function to get the contract address for a specific chain
export const getContractAddress = (chainId: number | undefined): `0x${string}` | undefined => {
  if (!chainId) return undefined
  return contractAddresses[chainId]
}

// Types for contract interactions
export type CreateProposalParams = {
  title: string
  details: string
  duration: bigint
}

export type CreateOpinionParams = {
  proposalId: bigint
  vote: boolean
  reasoning: string
}

export type VoteForOpinionParams = {
  proposalId: bigint
  opinionIndex: bigint
}

// Contract read functions
export const getProposalCount = async (publicClient: any, contractAddress: `0x${string}`) => {
  try {
    const count = await publicClient.readContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'proposalCount',
    })
    return count as bigint
  } catch (error) {
    console.error('Error getting proposal count:', error)
    throw error
  }
}

export const getProposal = async (
  publicClient: any,
  contractAddress: `0x${string}`,
  proposalId: bigint
) => {
  try {
    const proposal = await publicClient.readContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'proposals',
      args: [proposalId],
    })
    return proposal
  } catch (error) {
    console.error(`Error getting proposal ${proposalId}:`, error)
    throw error
  }
}

export const getVoteCost = async (publicClient: any, contractAddress: `0x${string}`) => {
  try {
    const voteCost = await publicClient.readContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'VOTE_COST',
    })
    return voteCost as bigint
  } catch (error) {
    console.error('Error getting vote cost:', error)
    // Fallback to the configured vote cost
    return parseEther(VOTE_COST)
  }
}

// Contract write functions
export const createProposal = async (
  walletClient: any,
  contractAddress: `0x${string}`,
  params: CreateProposalParams
) => {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'createProposal',
      args: [params.title, params.details, params.duration],
    })
    return hash
  } catch (error) {
    console.error('Error creating proposal:', error)
    throw error
  }
}

export const createOpinion = async (
  walletClient: any,
  contractAddress: `0x${string}`,
  params: CreateOpinionParams
) => {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'createOpinion',
      args: [params.proposalId, params.vote, params.reasoning],
      value: parseEther(VOTE_COST),
    })
    return hash
  } catch (error) {
    console.error('Error creating opinion:', error)
    throw error
  }
}

export const voteForOpinion = async (
  walletClient: any,
  contractAddress: `0x${string}`,
  params: VoteForOpinionParams
) => {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'voteForOpinion',
      args: [params.proposalId, params.opinionIndex],
      value: parseEther(VOTE_COST),
    })
    return hash
  } catch (error) {
    console.error('Error voting for opinion:', error)
    throw error
  }
}

export const finalizeProposal = async (
  walletClient: any,
  contractAddress: `0x${string}`,
  proposalId: bigint
) => {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'finalizeProposal',
      args: [proposalId],
    })
    return hash
  } catch (error) {
    console.error(`Error finalizing proposal ${proposalId}:`, error)
    throw error
  }
}

export const claimReward = async (
  walletClient: any,
  contractAddress: `0x${string}`,
  proposalId: bigint
) => {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'claimReward',
      args: [proposalId],
    })
    return hash
  } catch (error) {
    console.error(`Error claiming reward for proposal ${proposalId}:`, error)
    throw error
  }
} 