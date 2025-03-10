"use client"

import { useProposals } from "../contexts/ProposalsContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share, CheckCircle2, XCircle } from "lucide-react"

export default function ProposalDetails({ id }: { id: string }) {
  const { getProposal, version } = useProposals()
  const proposal = getProposal(Number.parseInt(id))

  console.log("Rendering ProposalDetails for proposal", id, "with version", version)

  if (!proposal) return <div>Proposal not found</div>

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

      <div className="space-y-4">
        {proposal.opinions.map((opinion) => (
          <Card
            key={opinion.id}
            className={`border-l-4 ${opinion.isYes ? "border-l-green-500" : "border-l-red-500"} transition-all duration-500 ease-in-out`}
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
              <div className={`flex items-center ${opinion.isYes ? "text-green-500" : "text-red-500"}`}>
                <Heart className="mr-1 h-4 w-4" />
                <span>
                  {opinion.likes} ({opinion.likeStake.toFixed(2)} ETH)
                </span>
              </div>
              <Share className="h-4 w-4 text-gray-500" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

