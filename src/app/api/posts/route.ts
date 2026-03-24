import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const postSelect = {
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
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: { comments: true, likes: true },
  },
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const communityId = searchParams.get('communityId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    const where = communityId ? { communityId } : {}

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      select: postSelect,
    })

    const hasMore = posts.length > limit
    const data = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore ? data[data.length - 1].id : null

    // Attach isLiked for authenticated users
    let postsWithLike = data as any[]
    if (session?.user?.id) {
      const likes = await prisma.like.findMany({
        where: {
          userId: session.user.id,
          postId: { in: data.map((p) => p.id) },
        },
        select: { postId: true },
      })
      const likedSet = new Set(likes.map((l) => l.postId))
      postsWithLike = data.map((p) => ({ ...p, isLiked: likedSet.has(p.id) }))
    }

    return NextResponse.json({ posts: postsWithLike, nextCursor, hasMore })
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(500, 'Post must be 500 characters or less'),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null),
  communityId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = createPostSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { content, imageUrl, communityId } = result.data

    // Verify community membership if posting to community
    if (communityId) {
      const membership = await prisma.communityMembership.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId,
          },
        },
      })
      if (!membership) {
        return NextResponse.json({ error: 'You must join this community to post' }, { status: 403 })
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl ?? null,
        authorId: session.user.id,
        communityId: communityId || null,
      },
      select: postSelect,
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
