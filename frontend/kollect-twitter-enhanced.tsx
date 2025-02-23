"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Share, CheckCircle2, XCircle } from "lucide-react"

// Simulated opinion data
const initialOpinions = [
  {
    id: 1,
    name: "Bob",
    username: "@bob",
    avatar: "/placeholder-user.jpg",
    content:
      "I support this proposal. Increasing the stake will lead to more thoughtful participation and reduce spam.",
    isYes: true,
    likes: 1,
    likeStake: 0.1,
    timestamp: "2m",
    lastVoted: Date.now() - 120000, // 2 minutes ago
  },
  {
    id: 2,
    name: "Carol",
    username: "@carol",
    avatar: "/placeholder-user.jpg",
    content:
      "I disagree. A higher stake might exclude smaller participants and centralize influence. We need diverse voices.",
    isYes: false,
    likes: 1,
    likeStake: 0.2,
    timestamp: "1m",
    lastVoted: Date.now() - 60000, // 1 minute ago
  },
]

export default function KOLlectTwitterEnhanced() {
  const [opinions, setOpinions] = useState(initialOpinions)
  const [totalYesStake, setTotalYesStake] = useState(0)
  const [totalNoStake, setTotalNoStake] = useState(0)

  // Calculate initial stakes
  useEffect(() => {
    const initialStakes = opinions.reduce(
      (acc, opinion) => {
        if (opinion.isYes) {
          acc.yes += opinion.likeStake
        } else {
          acc.no += opinion.likeStake
        }
        return acc
      },
      { yes: 0, no: 0 },
    )
    setTotalYesStake(initialStakes.yes)
    setTotalNoStake(initialStakes.no)
  }, [opinions])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const action = Math.random() > 0.9 ? "new_opinion" : "new_vote"

      if (action === "new_opinion") {
        const newStake = 1
        const isYes = Math.random() > 0.5
        const newOpinion = {
          id: Date.now(),
          name: `Agent${opinions.length + 1}`,
          username: `@agent${opinions.length + 1}`,
          avatar: "/placeholder-user.jpg",
          content: `This is a new ${isYes ? "YES" : "NO"} opinion on the proposal.`,
          isYes: isYes,
          likes: 1,
          likeStake: newStake,
          timestamp: "now",
          lastVoted: Date.now(),
        }
        setOpinions((prevOpinions) => [newOpinion, ...prevOpinions])
        if (isYes) {
          setTotalYesStake((prev) => Number.parseFloat((prev + newStake).toFixed(2)))
        } else {
          setTotalNoStake((prev) => Number.parseFloat((prev + newStake).toFixed(2)))
        }
      } else if (action === "new_vote" && opinions.length > 0) {
        const opinionIndex = Math.floor(Math.random() * opinions.length)
        const newStake = Number.parseFloat((Math.random() * 0.5).toFixed(2))
        setOpinions((prevOpinions) => {
          const newOpinions = [...prevOpinions]
          newOpinions[opinionIndex] = {
            ...newOpinions[opinionIndex],
            likes: newOpinions[opinionIndex].likes + 1,
            likeStake: Number.parseFloat((newOpinions[opinionIndex].likeStake + newStake).toFixed(2)),
            lastVoted: Date.now(),
          }
          // Move the voted opinion to the top
          const votedOpinion = newOpinions.splice(opinionIndex, 1)[0]
          newOpinions.unshift(votedOpinion)
          return newOpinions
        })
        if (opinions[opinionIndex].isYes) {
          setTotalYesStake((prev) => Number.parseFloat((prev + newStake).toFixed(2)))
        } else {
          setTotalNoStake((prev) => Number.parseFloat((prev + newStake).toFixed(2)))
        }
      }
    }, 5000) // New action every 15 seconds

    return () => clearInterval(interval)
  }, [opinions])

  const totalStake = Number.parseFloat((totalYesStake + totalNoStake).toFixed(2))
  const yesPercentage = totalStake > 0 ? Math.round((totalYesStake / totalStake) * 100) : 0
  const noPercentage = totalStake > 0 ? Math.round((totalNoStake / totalStake) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>KOLlect Proposal #1</CardTitle>
          <CardDescription>Increase stake requirement from 0.1 ETH to 0.5 ETH</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Proposed by @Alice • Voting ends in 24h</p>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-green-500">
              YES: {totalYesStake.toFixed(2)} ETH ({yesPercentage}%)
            </Badge>
            <Badge variant="outline" className="text-red-500">
              NO: {totalNoStake.toFixed(2)} ETH ({noPercentage}%)
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${yesPercentage}%` }}></div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Badge variant="outline">Total Stake: {totalStake} ETH</Badge>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {opinions.map((opinion) => (
          <Card
            key={opinion.id}
            className={`border-l-4 ${opinion.isYes ? "border-l-green-500" : "border-l-red-500"} transition-all duration-500 ease-in-out`}
            style={{
              backgroundColor:
                Date.now() - opinion.lastVoted < 5000
                  ? opinion.isYes
                    ? "rgba(0, 255, 0, 0.05)"
                    : "rgba(255, 0, 0, 0.05)"
                  : "white",
            }}
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

