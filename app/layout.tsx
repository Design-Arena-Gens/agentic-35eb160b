import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elite AI Agent',
  description: 'Advanced AI agent with multi-tool capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
