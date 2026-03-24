import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Mesh — Connect, Share, Discover',
  description: 'Discover the latest posts and communities on Project Mesh.',
}

export const revalidate = 60

async function getHomeData() {
  const [posts, trending, communities] = await Promise.all([
    prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        community: {
          select: { id: true, name: true, slug: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { likes: { _count: 'desc' } },
      select: {
        id: true,
        content: true,
        _count: { select: { likes: true } },
      },
    }),
    prisma.community.findMany({
      take: 6,
      orderBy: { members: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { members: true } },
      },
    }),
  ])

  return { posts, trending, communities }
}

export default async function HomePage() {
  const { posts, trending, communities } = await getHomeData()

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Feed */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Hero for logged out */}
          <div className="bg-gradient-to-r from-accent/20 to-purple-600/20 border border-accent/30 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Welcome to Project Mesh 🌐
            </h1>
            <p className="text-text-secondary mb-4">
              A modern social platform to share ideas, join communities, and connect with people.
            </p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Join Now — It&apos;s Free
              </Link>
              <Link
                href="/communities"
                className="bg-surface hover:bg-surface-hover border border-border text-text-primary font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Browse Communities
              </Link>
            </div>
          </div>

          {/* Composer (shown when logged in via client) */}
          <PostComposer />

          {/* Posts */}
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted text-lg">No posts yet. Be the first!</p>
                <Link href="/register" className="text-accent hover:underline text-sm mt-2 inline-block">
                  Create an account →
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post as any} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar trending={trending as any} communities={communities as any} />
      </main>
    </>
  )
}
