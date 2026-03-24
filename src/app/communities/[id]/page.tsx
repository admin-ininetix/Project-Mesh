import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { PostCard } from '@/components/feed/PostCard'
import { CommunityJoinButton } from './CommunityJoinButton'
import type { Metadata } from 'next'
import type { Post } from '@/types'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const community = await prisma.community.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    select: { name: true, description: true },
  })

  if (!community) return { title: 'Community not found' }

  return {
    title: `${community.name} — Project Mesh`,
    description: community.description || `Join the ${community.name} community on Project Mesh.`,
  }
}

async function getCommunityData(slugOrId: string) {
  const community = await prisma.community.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
    },
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

  return community
}

async function getCommunityPosts(communityId: string) {
  return prisma.post.findMany({
    where: { communityId },
    orderBy: { createdAt: 'desc' },
    take: 20,
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
      community: { select: { id: true, name: true, slug: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })
}

export default async function CommunityPage({ params }: Props) {
  const community = await getCommunityData(params.id)
  if (!community) notFound()

  const posts = await getCommunityPosts(community.id)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Community Header */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-accent/30 to-purple-600/30" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-2xl font-bold text-white -mt-10 ring-4 ring-surface">
                  {community.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">{community.name}</h1>
                  <p className="text-sm text-text-muted">/{community.slug}</p>
                </div>
              </div>
              <CommunityJoinButton communityId={community.id} communitySlug={community.slug} />
            </div>

            {community.description && (
              <p className="text-text-secondary text-sm mt-4">{community.description}</p>
            )}

            <div className="flex gap-5 mt-4 text-sm text-text-muted">
              <span>
                <strong className="text-text-primary">{community._count.members}</strong> members
              </span>
              <span>
                <strong className="text-text-primary">{community._count.posts}</strong> posts
              </span>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-xl">
              <p className="text-text-muted">No posts in this community yet.</p>
              <p className="text-text-muted text-sm mt-1">Join and be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as unknown as Post}
                  showCommunity={false}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
