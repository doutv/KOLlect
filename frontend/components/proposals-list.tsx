"use client"

import { useProposals } from "../contexts/ProposalsContext"
import ProposalCard from "./proposal-card"
import { useEffect, useState, useRef } from "react"

export default function ProposalsList() {
  const { proposals, version } = useProposals()
  const [lastUpdatedIds, setLastUpdatedIds] = useState<number[]>([])
  const prevVersionRef = useRef(version)
  const prevProposalsRef = useRef(proposals)

  // Track which proposals have been updated
  useEffect(() => {
    if (prevVersionRef.current !== version) {
      const updatedIds: number[] = []
      
      proposals.forEach((proposal) => {
        const prevProposal = prevProposalsRef.current.find((p) => p.id === proposal.id)
        
        // If proposal is new or has been updated
        if (!prevProposal || prevProposal.lastUpdated !== proposal.lastUpdated) {
          updatedIds.push(proposal.id)
        }
      })
      
      setLastUpdatedIds(updatedIds)
      prevVersionRef.current = version
      prevProposalsRef.current = proposals
    }
  }, [proposals, version])

  // Clear the "new" status after 5 seconds
  useEffect(() => {
    if (lastUpdatedIds.length > 0) {
      const timer = setTimeout(() => {
        setLastUpdatedIds([])
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [lastUpdatedIds])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Proposals</h2>
      <div>
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isNew={lastUpdatedIds.includes(proposal.id)}
          />
        ))}
      </div>
    </div>
  )
}

