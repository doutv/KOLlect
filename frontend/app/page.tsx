import ProposalsList from "../components/proposals-list"

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Active Proposals</h1>
      <ProposalsList />
    </div>
  )
}

