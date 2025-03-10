"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProposals } from "../contexts/ProposalsContext"

export default function CreateProposalForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hours, setHours] = useState("24")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { addProposal } = useProposals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a new proposal
      addProposal({
        title,
        description,
        proposedBy: "@User" + Math.floor(Math.random() * 100), // Random user for demo
        timeLeft: `${hours}h`,
        totalStake: 0.1,
        yesPercentage: 50,
        noPercentage: 50,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Success - redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error creating proposal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 border rounded-md"
              placeholder="Enter proposal title"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder="Describe your proposal in detail"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium">
              Expiration (hours)
            </label>
            <select
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
              <option value="96">96 hours</option>
              <option value="168">1 week</option>
            </select>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create Proposal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

