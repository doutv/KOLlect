"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProposals } from "../contexts/ProposalsContext"
import { useWeb3 } from "../contexts/Web3Context"
import { useSymposium } from "../hooks/useSymposium"
import { TransactionStatus } from "./transaction-status"
import { DURATION_OPTIONS } from "@/contracts/config"

export default function CreateProposalForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value) // Default to 1 day
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [txError, setTxError] = useState<Error | null>(null)
  const [confirmations, setConfirmations] = useState(0)
  
  const router = useRouter()
  const { addProposal } = useProposals()
  const { isConnected, isCorrectNetwork } = useWeb3()
  const { createProposal, isContractAvailable } = useSymposium()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      // Call the contract
      const txResult = await createProposal(
        title,
        description,
        BigInt(duration)
      )
      
      setTxHash(txResult.hash)
      setTxStatus('confirming')
      
      // Wait for confirmations
      const receipt = await txResult.confirmTransaction()
      
      // Update confirmations
      setConfirmations(1)
      
      // Add to local state optimistically
      addProposal({
        title,
        description,
        proposedBy: "On-chain", // This will be updated when we fetch from blockchain
        timeLeft: DURATION_OPTIONS.find(option => option.value === duration)?.label || "1 day",
        totalStake: 0,
        yesPercentage: 0,
        noPercentage: 0,
      })
      
      // Set success status
      setTxStatus('success')
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Error creating proposal:", error)
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
    
    if (txStatus === 'success') {
      router.push("/")
    }
  }
  
  const handleRetry = () => {
    handleSubmit(new Event('submit') as unknown as React.FormEvent)
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Proposal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter proposal title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[100px]"
                placeholder="Describe your proposal in detail"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select 
                value={duration} 
                onValueChange={(value) => setDuration(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !isConnected || !isCorrectNetwork || !isContractAvailable} 
                className="w-full"
              >
                {isSubmitting ? "Creating..." : "Create Proposal"}
              </Button>
              
              {!isConnected && (
                <p className="text-center mt-2 text-sm text-red-500">
                  Please connect your wallet to create a proposal
                </p>
              )}
              
              {isConnected && !isCorrectNetwork && (
                <p className="text-center mt-2 text-sm text-yellow-500">
                  Please switch to the correct network
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {txStatus !== 'idle' && (
        <div className="max-w-2xl mx-auto">
          <TransactionStatus
            status={txStatus}
            hash={txHash}
            error={txError}
            confirmations={confirmations}
            onDismiss={handleDismiss}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  )
}

