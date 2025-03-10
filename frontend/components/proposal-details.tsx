"use client"

import { useProposals } from "../contexts/ProposalsContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share, CheckCircle2, XCircle, Info } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWeb3 } from "../contexts/Web3Context"
import { useSymposium } from "../hooks/useSymposium"
import { TransactionStatus } from "./transaction-status"
import { VOTE_COST } from "@/contracts/config"
import AddOpinion from "./add-opinion"

export default function ProposalDetails({ id }: { id: string }) {
  const { getProposal, version } = useProposals()
  const { isConnected, isCorrectNetwork } = useWeb3()
  const { voteForOpinion, isContractAvailable } = useSymposium()
  
  const proposal = getProposal(Number.parseInt(id))
  const [selectedOpinionId, setSelectedOpinionId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [txError, setTxError] = useState<Error | null>(null)
  const [confirmations, setConfirmations] = useState(0)

  console.log("Rendering ProposalDetails for proposal", id, "with version", version)

  if (!proposal) return <div>Proposal not found</div>

  const handleVoteClick = (opinionId: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    
    if (!isCorrectNetwork) {
      alert("Please switch to the correct network")
      return
    }
    
    if (!isContractAvailable) {
      alert("Contract is not available on this network")
      return
    }

    setSelectedOpinionId(opinionId)
    setIsDialogOpen(true)
  }

  const handleVoteConfirm = async () => {
    if (selectedOpinionId === null) return
    
    setIsDialogOpen(false)
    setTxStatus('pending')
    setTxError(null)
    
    try {
      // Call the contract to vote for the opinion
      const txResult = await voteForOpinion(
        BigInt(proposal.id),
        BigInt(selectedOpinionId)
      )
      
      setTxHash(txResult.hash)
      setTxStatus('confirming')
      
      // Wait for confirmation
      const receipt = await txResult.confirmTransaction()
      
      // Update local state with confirmation
      setConfirmations(1)
      setTxStatus('success')
      
      // Reset
      setSelectedOpinionId(null)
    } catch (error) {
      console.error("Error voting for opinion:", error)
      setTxError(error as Error)
      setTxStatus('error')
    }
  }
  
  const handleDismiss = () => {
    setTxStatus('idle')
    setTxHash(undefined)
    setTxError(null)
    setConfirmations(0)
  }
  
  const handleRetry = () => {
    if (selectedOpinionId !== null) {
      handleVoteConfirm()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{proposal.title}</CardTitle>
          <CardDescription>{proposal.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            Proposed by {proposal.proposedBy} • Voting ends in {proposal.timeLeft}
          </p>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-green-500">
              YES: {proposal.yesPercentage}%
            </Badge>
            <Badge variant="outline" className="text-red-500">
              NO: {proposal.noPercentage}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${proposal.yesPercentage}%` }}></div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Badge variant="outline">Total Stake: {proposal.totalStake.toFixed(2)} ETH</Badge>
        </CardFooter>
      </Card>

      <AddOpinion proposalId={proposal.id} />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Opinions ({proposal.opinions.length})</h3>
        {proposal.opinions.map((opinion) => (
          <Card
            key={opinion.id}
            className={`border-l-4 ${opinion.isYes ? "border-l-green-500" : "border-l-red-500"} transition-all duration-500 ease-in-out hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-start space-x-4 pb-2">
              <Avatar>
                <AvatarImage src={opinion.avatar} alt={opinion.name} />
                <AvatarFallback>{opinion.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{opinion.name}</CardTitle>
                    <CardDescription>
                      {opinion.username} • {opinion.timestamp}
                    </CardDescription>
                  </div>
                  {opinion.isYes ? (
                    <CheckCircle2 className="text-green-500 h-6 w-6" />
                  ) : (
                    <XCircle className="text-red-500 h-6 w-6" />
                  )}
                </div>
                <p className="mt-2">{opinion.content}</p>
              </div>
            </CardHeader>
            <CardFooter className="justify-between pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center ${opinion.likes > 0 ? "text-pink-500" : "text-gray-500"} hover:text-pink-500`}
                      onClick={() => handleVoteClick(opinion.id)}
                      disabled={!isConnected || !isCorrectNetwork || !isContractAvailable}
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      <span>
                        {opinion.likes} ({opinion.likeStake.toFixed(2)} ETH)
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vote for this opinion with {VOTE_COST} ETH</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Share className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote for this opinion</DialogTitle>
            <DialogDescription>
              You will stake {VOTE_COST} ETH to vote for this opinion. This stake will go to the creator of the opinion if their side wins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                <Info className="text-blue-500 h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700">Note</h4>
                  <p className="text-sm text-blue-600">Voting costs exactly {VOTE_COST} ETH. This amount is fixed in the smart contract.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleVoteConfirm}>Confirm Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {txStatus !== 'idle' && (
        <TransactionStatus
          status={txStatus}
          hash={txHash}
          error={txError}
          confirmations={confirmations}
          onDismiss={handleDismiss}
          onRetry={handleRetry}
          title={txStatus === 'success' ? "Vote Successful" : undefined}
          description={txStatus === 'success' ? "Your vote has been recorded on the blockchain" : undefined}
        />
      )}
    </div>
  )
}

