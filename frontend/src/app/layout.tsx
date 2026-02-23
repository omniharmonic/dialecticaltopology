import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dialectical Topology',
  description: 'Exploring the hidden structure of philosophical debate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-field text-ink">
        {children}
      </body>
    </html>
  )
}
