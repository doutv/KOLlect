import CreateProposalForm from "../../components/create-proposal-form"
import Link from "next/link"

export default function CreateProposalPage() {
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 mr-4">
          ← Back to Proposals
        </Link>
      </div>
      <CreateProposalForm />
    </div>
  )
}

