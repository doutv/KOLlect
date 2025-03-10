"use client"

import { useState } from "react"
import { useProposals } from "../contexts/ProposalsContext"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "../contexts/Web3Context"
import { useSymposium } from "../hooks/useSymposium"
import { TransactionStatus } from "./transaction-status"
import { VOTE_COST } from "@/contracts/config"

interface AddOpinionProps {
  proposalId: number
}

export default function AddOpinion({ proposalId }: AddOpinionProps) {
  const { addOpinion } = useProposals()
  const { isConnected, isCorrectNetwork } = useWeb3()
  const { createOpinion, isContractAvailable } = useSymposium()
  
  const [content, setContent] = useState("")
  const [isYes, setIsYes] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [txError, setTxError] = useState<Error | null>(null)
  const [confirmations, setConfirmations] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content || isYes === null) {
      return
    }
    
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
    
    setIsSubmitting(true)
    setTxStatus('pending')
    setTxError(null)
    
    try {
      // Call the contract to create an opinion
      const txResult = await createOpinion(
        BigInt(proposalId),
        isYes,
        content
      )
      
      setTxHash(txResult.hash)
      setTxStatus('confirming')
      
      // Wait for confirmation
      const receipt = await txResult.confirmTransaction()
      
      // Update local state optimistically
      addOpinion(proposalId, {
        name: "Anonymous",
        username: "@user",
        avatar: "/placeholder-user.jpg",
        content,
        isYes
      })
      
      // Update confirmation status
      setConfirmations(1)
      setTxStatus('success')
      
      // Reset form
      setContent("")
      setIsYes(null)
    } catch (error) {
      console.error("Error creating opinion:", error)
      setTxError(error as Error)
      setTxStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDismiss = () => {
    setTxStatus('idle')
    setTxHash(undefined)
    setTxError(null)
    setConfirmations(0)
  }
  
  const handleRetry = () => {
    handleSubmit(new Event('submit') as unknown as React.FormEvent)
  }

  return (
    <div className="space-y-4">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Share Your Opinion</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stance">Your Stance</Label>
              <RadioGroup 
                id="stance" 
                className="flex space-x-4"
                value={isYes === null ? undefined : isYes ? "yes" : "no"}
                onValueChange={(value) => setIsYes(value === "yes")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="flex items-center cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Support
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="flex items-center cursor-pointer">
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Oppose
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="opinion">Your Opinion</Label>
              <Textarea 
                id="opinion" 
                placeholder="Share your thoughts on this proposal..." 
                className="min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription>
                Creating an opinion requires a payment of {VOTE_COST} ETH. This amount is fixed in the smart contract.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !content || isYes === null || !isConnected || !isCorrectNetwork || !isContractAvailable}
            >
              {isSubmitting ? "Submitting..." : "Submit Opinion"}
            </Button>
            
            {!isConnected && (
              <p className="text-center mt-2 text-sm text-red-500">
                Please connect your wallet to submit an opinion
              </p>
            )}
            
            {isConnected && !isCorrectNetwork && (
              <p className="text-center mt-2 text-sm text-yellow-500">
                Please switch to the correct network
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
      
      {txStatus !== 'idle' && (
        <TransactionStatus
          status={txStatus}
          hash={txHash}
          error={txError}
          confirmations={confirmations}
          onDismiss={handleDismiss}
          onRetry={handleRetry}
          title={txStatus === 'success' ? "Opinion Submitted" : undefined}
          description={txStatus === 'success' ? "Your opinion has been recorded on the blockchain" : undefined}
        />
      )}
    </div>
  )
} 