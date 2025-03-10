import { Suspense } from "react"
import ProposalDetails from "../../../components/proposal-details"
import Link from "next/link"

export default function ProposalPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 mr-4">
          ← Back to Proposals
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ProposalDetails id={params.id} />
      </Suspense>
    </div>
  )
}

