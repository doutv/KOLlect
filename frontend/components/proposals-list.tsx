"use client"

import { useProposals } from "../contexts/ProposalsContext"
import ProposalCard from "./proposal-card"
import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function ProposalsList() {
  const { proposals, version } = useProposals()
  const [clientSideProposals, setClientSideProposals] = useState<Array<any>>([])
  const [isClient, setIsClient] = useState(false)
  
  // Set isClient to true once component is mounted
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Only update isNew status on the client side after hydration
  useEffect(() => {
    if (isClient) {
      setClientSideProposals(
        proposals.map((proposal, index) => ({
          ...proposal,
          isNew: index === 0 && proposal.lastUpdated > Date.now() - 5000
        }))
      )
    }
  }, [proposals, version, isClient])

  // Use an empty array for initial server render to avoid hydration mismatch
  useEffect(() => {
    if (isClient && clientSideProposals.length === 0 && proposals.length > 0) {
      setClientSideProposals(proposals.map(proposal => ({ ...proposal, isNew: false })))
    }
  }, [proposals, clientSideProposals, isClient])

  // Server-side or initial render
  if (!isClient) {
    return (
      <div className="space-y-6">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="opacity-0">
            <ProposalCard proposal={proposal} isNew={false} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {clientSideProposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            layout
          >
            <ProposalCard proposal={proposal} isNew={proposal.isNew} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

