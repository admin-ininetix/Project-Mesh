import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Not Found — Project Mesh',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-accent/20 select-none mb-6">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Page not found</h1>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/communities"
            className="bg-surface hover:bg-surface-hover border border-border text-text-primary font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Explore communities
          </Link>
        </div>
      </div>
    </div>
  )
}
