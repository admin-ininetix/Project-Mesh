'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  trending?: { id: string; content: string; _count: { likes: number } }[]
  communities?: { id: string; name: string; slug: string; _count: { members: number } }[]
}

export function Sidebar({ trending = [], communities = [] }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-4">
        {/* Trending */}
        {trending.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-semibold text-text-primary mb-3">🔥 Trending</h3>
            <div className="space-y-2">
              {trending.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors truncate"
                >
                  {post.content.slice(0, 60)}…
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Communities */}
        {communities.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-semibold text-text-primary mb-3">🌐 Communities</h3>
            <div className="space-y-2">
              {communities.map((c) => (
                <Link
                  key={c.id}
                  href={`/communities/${c.slug}`}
                  className="flex items-center justify-between text-sm hover:bg-surface-hover rounded-lg px-2 py-1 transition-colors group"
                >
                  <span className="text-text-secondary group-hover:text-text-primary">{c.name}</span>
                  <span className="text-xs text-text-muted">{c._count.members}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/communities"
              className="block mt-3 text-xs text-accent hover:text-accent-hover text-center"
            >
              View all communities →
            </Link>
          </div>
        )}

        {/* App Info */}
        <div className="text-xs text-text-muted space-y-1 px-2">
          <p>© 2024 Project Mesh</p>
          <div className="flex gap-2 flex-wrap">
            <Link href="/about" className="hover:text-text-secondary">About</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-text-secondary">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-text-secondary">Terms</Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
