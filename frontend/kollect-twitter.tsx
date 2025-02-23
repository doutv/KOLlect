import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react"

export default function KOLlectTwitter() {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>KOLlect Proposal #1</CardTitle>
          <CardDescription>Increase stake requirement from 0.1 ETH to 0.5 ETH</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Proposed by @Alice • Voting ends in 24h</p>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="flex space-x-2">
            <Badge variant="outline">In Progress</Badge>
            <Badge variant="outline">Total Stake: 0.5 ETH</Badge>
          </div>
          <Button variant="outline">View Details</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-start space-x-4 pb-2">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="Bob" />
              <AvatarFallback>Bob</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <CardTitle className="text-lg">Bob</CardTitle>
                <CardDescription className="ml-2">@bob • 2m</CardDescription>
              </div>
              <p className="mt-2">
                I support this proposal. Increasing the stake will lead to more thoughtful participation and reduce
                spam. #KOLlectYES
              </p>
              <Badge className="mt-2" variant="outline">
                Staked: 0.1 ETH
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="justify-between pt-2">
            <Button variant="ghost" size="sm">
              <MessageCircle className="mr-1 h-4 w-4" />
              12
            </Button>
            <Button variant="ghost" size="sm">
              <Repeat2 className="mr-1 h-4 w-4" />5
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500">
              <Heart className="mr-1 h-4 w-4" />
              24 (0.15 ETH)
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start space-x-4 pb-2">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="Carol" />
              <AvatarFallback>Carol</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <CardTitle className="text-lg">Carol</CardTitle>
                <CardDescription className="ml-2">@carol • 1m</CardDescription>
              </div>
              <p className="mt-2">
                I disagree. A higher stake might exclude smaller participants and centralize influence. We need diverse
                voices. #KOLlectNO
              </p>
              <Badge className="mt-2" variant="outline">
                Staked: 0.2 ETH
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="justify-between pt-2">
            <Button variant="ghost" size="sm">
              <MessageCircle className="mr-1 h-4 w-4" />8
            </Button>
            <Button variant="ghost" size="sm">
              <Repeat2 className="mr-1 h-4 w-4" />3
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500">
              <Heart className="mr-1 h-4 w-4" />
              15 (0.05 ETH)
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-4 flex justify-between">
        <Button variant="outline">Load More</Button>
        <Button>New Opinion</Button>
      </div>
    </div>
  )
}

