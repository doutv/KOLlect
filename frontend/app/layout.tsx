import type React from "react"
import "./globals.css"
import "../styles/globals.css"
import { Inter } from "next/font/google"
import { ProposalsProvider } from "../contexts/ProposalsContext"
import Header from "../components/header"
import { ThemeProvider } from "../components/theme-provider"
import { Web3Provider } from "../contexts/Web3Context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "KOLlect",
  description: "A platform for decentralized decision making",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/_next/static/css/app/layout.css" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Web3Provider>
            <ProposalsProvider>
              <div className="min-h-screen bg-gray-100">
                <Header />
                <main className="py-10">
                  <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
                </main>
              </div>
            </ProposalsProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'