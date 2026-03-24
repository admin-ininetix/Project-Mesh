import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { CreateCommunityButton } from './CreateCommunityButton'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Communities — Project Mesh',
  description: 'Discover and join communities on Project Mesh.',
}

export const revalidate = 120

async function getCommunities() {
  return prisma.community.findMany({
    orderBy: { members: { _count: 'desc' } },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      _count: { select: { members: true, posts: true } },
    },
  })
}

export default async function CommunitiesPage() {
  const communities = await getCommunities()

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Communities</h1>
            <p className="text-text-secondary text-sm mt-1">
              {communities.length} communities to explore
            </p>
          </div>
          <CreateCommunityButton />
        </div>

        {/* Grid */}
        {communities.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌐</div>
            <p className="text-text-secondary text-lg">No communities yet.</p>
            <p className="text-text-muted text-sm mt-2">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 hover:bg-surface-hover transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-purple-600/30 flex items-center justify-center shrink-0 text-xl">
                    {community.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={community.imageUrl}
                        alt={community.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      community.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                      {community.name}
                    </h3>
                    {community.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                      <span>👥 {community._count.members} members</span>
                      <span>📝 {community._count.posts} posts</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
