import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { PostCard } from '@/components/feed/PostCard'
import { CommentSection } from '@/components/feed/CommentSection'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Post } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      content: true,
      author: { select: { displayName: true, username: true } },
    },
  })

  if (!post) return { title: 'Post not found' }

  const description = post.content.slice(0, 160)
  return {
    title: `${post.author.displayName} on Project Mesh`,
    description,
    openGraph: {
      title: `${post.author.displayName} on Project Mesh`,
      description,
    },
  }
}

async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
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
          bio: true,
          role: true,
          _count: { select: { posts: true, followers: true } },
        },
      },
      community: { select: { id: true, name: true, slug: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) notFound()

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Back nav */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to feed
          </Link>
        </div>

        {/* Post */}
        <PostCard post={post as unknown as Post} />

        {/* Author Card */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar
                src={post.author.avatarUrl}
                alt={post.author.displayName}
                size="lg"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-text-primary hover:text-accent transition-colors"
              >
                {post.author.displayName}
              </Link>
              <p className="text-sm text-text-muted">@{post.author.username}</p>
              {post.author.bio && (
                <p className="text-sm text-text-secondary mt-2">{post.author.bio}</p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-text-muted">
                <span><strong className="text-text-primary">{post.author._count.posts}</strong> posts</span>
                <span><strong className="text-text-primary">{post.author._count.followers}</strong> followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <CommentSection postId={post.id} />
        </div>
      </main>
    </>
  )
}
