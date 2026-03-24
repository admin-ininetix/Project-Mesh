import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { PostCard } from '@/components/feed/PostCard'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Post } from '@/types'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { displayName: true, bio: true },
  })

  if (!user) return { title: 'User not found' }

  return {
    title: `${user.displayName} (@${username}) — Project Mesh`,
    description: user.bio || `${user.displayName}'s profile on Project Mesh`,
  }
}

async function getUserProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: { posts: true, followers: true, following: true },
      },
    },
  })
  return user
}

async function getUserPosts(userId: string) {
  return prisma.post.findMany({
    where: { authorId: userId },
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

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const user = await getUserProfile(username)
  if (!user) notFound()

  const posts = await getUserPosts(user.id)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Profile Header */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-br from-accent/40 to-purple-600/40" />
          {/* Info */}
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar
                src={user.avatarUrl}
                alt={user.displayName}
                size="xl"
                className="ring-4 ring-surface"
              />
              <div className="flex gap-2 mt-10">
                {/* Follow button rendered client-side via separate component — placeholder */}
                <FollowButton username={user.username} userId={user.id} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary">{user.displayName}</h1>
                {user.role !== 'USER' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {user.role.toLowerCase()}
                  </span>
                )}
              </div>
              <p className="text-text-muted text-sm">@{user.username}</p>
              {user.bio && (
                <p className="text-text-secondary text-sm mt-3">{user.bio}</p>
              )}
              <div className="flex gap-5 mt-4 text-sm">
                <div>
                  <span className="font-bold text-text-primary">{user._count.posts}</span>
                  <span className="text-text-muted ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-text-primary">{user._count.followers}</span>
                  <span className="text-text-muted ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-text-primary">{user._count.following}</span>
                  <span className="text-text-muted ml-1">Following</span>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-xl">
              <p className="text-text-muted">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post as unknown as Post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

// Client component for follow button
function FollowButton({ username, userId }: { username: string; userId: string }) {
  // Rendered server-side as placeholder; client interaction happens via hydration
  return (
    <form action={`/api/users/${username}/follow`} method="POST">
      <button
        type="submit"
        className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Follow
      </button>
    </form>
  )
}
