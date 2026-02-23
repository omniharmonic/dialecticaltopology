import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dialectical Topology',
  description: 'Interactive exploration of the Marcus-Demartini debate on evil, nonduality, and moral knowledge',
  openGraph: {
    title: 'Dialectical Topology',
    description: 'Explore the hidden structure of philosophical debate',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void antialiased">
        {children}
      </body>
    </html>
  )
}
