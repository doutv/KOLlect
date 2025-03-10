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

// Gas limit constants for testnet transactions
// These are conservative estimates to ensure transactions go through
const GAS_LIMITS = {
  CREATE_PROPOSAL: BigInt(500000),
  CREATE_OPINION: BigInt(300000),
  VOTE_FOR_OPINION: BigInt(250000),
  FINALIZE_PROPOSAL: BigInt(400000),
  CLAIM_REWARD: BigInt(200000)
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

// Helper function to safely estimate gas or use default
const safelyEstimateGas = async (
  walletClient: any,
  publicClient: any, 
  txParams: any, 
  defaultGasLimit: bigint
) => {
  try {
    const gasEstimate = await publicClient.estimateContractGas({
      ...txParams,
      account: walletClient.account
    })
    
    // Add 20% buffer to gas estimate
    return (gasEstimate * BigInt(120)) / BigInt(100)
  } catch (error) {
    console.warn('Gas estimation failed, using default gas limit:', error)
    return defaultGasLimit
  }
}

// Contract write functions
export const createProposal = async (
  walletClient: any,
  publicClient: any,
  contractAddress: `0x${string}`,
  params: CreateProposalParams
) => {
  try {
    const txParams = {
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'createProposal',
      args: [params.title, params.details, params.duration],
    }
    
    // Safely estimate gas or use default
    const gas = await safelyEstimateGas(
      walletClient,
      publicClient,
      txParams,
      GAS_LIMITS.CREATE_PROPOSAL
    )
    
    // Send transaction with gas limit
    const hash = await walletClient.writeContract({
      ...txParams,
      gas
    })
    
    return hash
  } catch (error) {
    console.error('Error creating proposal:', error)
    throw error
  }
}

export const createOpinion = async (
  walletClient: any,
  publicClient: any,
  contractAddress: `0x${string}`,
  params: CreateOpinionParams
) => {
  try {
    const txParams = {
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'createOpinion',
      args: [params.proposalId, params.vote, params.reasoning],
      value: parseEther(VOTE_COST),
    }
    
    // Safely estimate gas or use default
    const gas = await safelyEstimateGas(
      walletClient,
      publicClient,
      txParams,
      GAS_LIMITS.CREATE_OPINION
    )
    
    // Send transaction with gas limit
    const hash = await walletClient.writeContract({
      ...txParams,
      gas
    })
    
    return hash
  } catch (error) {
    console.error('Error creating opinion:', error)
    throw error
  }
}

export const voteForOpinion = async (
  walletClient: any,
  publicClient: any,
  contractAddress: `0x${string}`,
  params: VoteForOpinionParams
) => {
  try {
    const txParams = {
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'voteForOpinion',
      args: [params.proposalId, params.opinionIndex],
      value: parseEther(VOTE_COST),
    }
    
    // Safely estimate gas or use default
    const gas = await safelyEstimateGas(
      walletClient,
      publicClient,
      txParams,
      GAS_LIMITS.VOTE_FOR_OPINION
    )
    
    // Send transaction with gas limit
    const hash = await walletClient.writeContract({
      ...txParams,
      gas
    })
    
    return hash
  } catch (error) {
    console.error('Error voting for opinion:', error)
    throw error
  }
}

export const finalizeProposal = async (
  walletClient: any,
  publicClient: any,
  contractAddress: `0x${string}`,
  proposalId: bigint
) => {
  try {
    const txParams = {
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'finalizeProposal',
      args: [proposalId],
    }
    
    // Safely estimate gas or use default
    const gas = await safelyEstimateGas(
      walletClient,
      publicClient,
      txParams,
      GAS_LIMITS.FINALIZE_PROPOSAL
    )
    
    // Send transaction with gas limit
    const hash = await walletClient.writeContract({
      ...txParams,
      gas
    })
    
    return hash
  } catch (error) {
    console.error(`Error finalizing proposal ${proposalId}:`, error)
    throw error
  }
}

export const claimReward = async (
  walletClient: any,
  publicClient: any,
  contractAddress: `0x${string}`,
  proposalId: bigint
) => {
  try {
    const txParams = {
      address: contractAddress,
      abi: SymposiumABI,
      functionName: 'claimReward',
      args: [proposalId],
    }
    
    // Safely estimate gas or use default
    const gas = await safelyEstimateGas(
      walletClient,
      publicClient,
      txParams,
      GAS_LIMITS.CLAIM_REWARD
    )
    
    // Send transaction with gas limit
    const hash = await walletClient.writeContract({
      ...txParams,
      gas
    })
    
    return hash
  } catch (error) {
    console.error(`Error claiming reward for proposal ${proposalId}:`, error)
    throw error
  }
} 