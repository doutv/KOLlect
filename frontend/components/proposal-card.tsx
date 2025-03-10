"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"

interface ProposalCardProps {
  proposal: {
    id: number
    title: string
    description: string
    proposedBy: string
    timeLeft: string
    totalStake: number
    yesPercentage: number
    noPercentage: number
    opinions?: { id: number }[]
  }
  isNew: boolean
}

export default function ProposalCard({ proposal, isNew }: ProposalCardProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const opinionCount = proposal.opinions?.length || 0

  return (
    <Card className={`mb-4 ${mounted && isNew ? "border-2 border-blue-500" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/proposal/${proposal.id}`}>
              <CardTitle className="hover:text-indigo-600 cursor-pointer transition-colors">{proposal.title}</CardTitle>
            </Link>
            <CardDescription>{proposal.description}</CardDescription>
          </div>
          {mounted && isNew && (
            <Badge variant="secondary" className="animate-pulse">
              New Update
            </Badge>
          )}
        </div>
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
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${proposal.yesPercentage}%` }}
          ></div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">Total Stake: {proposal.totalStake.toFixed(2)} ETH</Badge>
          <div className="flex items-center text-gray-500">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{opinionCount} opinion{opinionCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <Link href={`/proposal/${proposal.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

