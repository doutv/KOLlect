"use client"

import { useProposals } from "../contexts/ProposalsContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AddOpinion from "./add-opinion"

export default function ProposalDetails({ id }: { id: string }) {
  const { getProposal, loveOpinion, version } = useProposals()
  const proposal = getProposal(Number.parseInt(id))
  const [selectedOpinionId, setSelectedOpinionId] = useState<number | null>(null)
  const [stakeAmount, setStakeAmount] = useState("0.01")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  console.log("Rendering ProposalDetails for proposal", id, "with version", version)

  if (!proposal) return <div>Proposal not found</div>

  const handleLoveClick = (opinionId: number) => {
    setSelectedOpinionId(opinionId)
    setIsDialogOpen(true)
  }

  const handleLoveConfirm = () => {
    if (selectedOpinionId !== null) {
      loveOpinion(proposal.id, selectedOpinionId, parseFloat(stakeAmount))
      setIsDialogOpen(false)
      setSelectedOpinionId(null)
      setStakeAmount("0.01")
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
                      onClick={() => handleLoveClick(opinion.id)}
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      <span>
                        {opinion.likes} ({opinion.likeStake.toFixed(2)} ETH)
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Love this opinion with stake</p>
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
            <DialogTitle>Love this opinion</DialogTitle>
            <DialogDescription>
              Add stake to show your support for this opinion. The more stake you add, the more weight your love carries.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stake">Stake Amount (ETH)</Label>
              <Input
                id="stake"
                type="number"
                min="0.01"
                step="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLoveConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

