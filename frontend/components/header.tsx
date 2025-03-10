"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">KOLlect</span>
              <span className="ml-2 text-sm text-gray-500">Decentralized Decision Making</span>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              Proposals
            </Link>
            <Link
              href="/create-proposal"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/create-proposal"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              Create Proposal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

