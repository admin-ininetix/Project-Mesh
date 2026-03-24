import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Project Mesh — Connect, Share, Discover',
    template: '%s | Project Mesh',
  },
  description:
    'Project Mesh is a modern social platform for sharing ideas, building communities, and connecting with people who share your interests.',
  keywords: ['social media', 'communities', 'posts', 'network'],
  openGraph: {
    type: 'website',
    siteName: 'Project Mesh',
    title: 'Project Mesh — Connect, Share, Discover',
    description: 'A modern social platform for ideas and communities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Mesh',
    description: 'A modern social platform for ideas and communities.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text-primary min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
