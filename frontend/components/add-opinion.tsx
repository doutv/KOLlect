"use client"

import { useState } from "react"
import { useProposals } from "../contexts/ProposalsContext"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"

interface AddOpinionProps {
  proposalId: number
}

export default function AddOpinion({ proposalId }: AddOpinionProps) {
  const { addOpinion } = useProposals()
  const [content, setContent] = useState("")
  const [isYes, setIsYes] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content || isYes === null) {
      return
    }
    
    setIsSubmitting(true)
    
    addOpinion(proposalId, {
      name: "Anonymous",
      username: "@user",
      avatar: "/placeholder-user.jpg", // Default avatar
      content,
      isYes
    })
    
    // Reset form
    setContent("")
    setIsYes(null)
    setIsSubmitting(false)
  }

  return (
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
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !content || isYes === null}
          >
            Submit Opinion
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 