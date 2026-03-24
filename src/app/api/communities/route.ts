import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const communities = await prisma.community.findMany({
      orderBy: { members: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        _count: {
          select: { members: true, posts: true },
        },
      },
    })

    if (session?.user?.id) {
      const memberships = await prisma.communityMembership.findMany({
        where: { userId: session.user.id },
        select: { communityId: true },
      })
      const memberSet = new Set(memberships.map((m) => m.communityId))
      return NextResponse.json({
        communities: communities.map((c) => ({ ...c, isMember: memberSet.has(c.id) })),
      })
    }

    return NextResponse.json({ communities })
  } catch (error) {
    console.error('GET /api/communities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createCommunitySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = createCommunitySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, description, imageUrl } = result.data
    const slug = slugify(name)

    const existing = await prisma.community.findFirst({
      where: { OR: [{ name }, { slug }] },
    })
    if (existing) {
      return NextResponse.json({ error: 'A community with this name already exists' }, { status: 409 })
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl ?? null,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
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

    return NextResponse.json({ community }, { status: 201 })
  } catch (error) {
    console.error('POST /api/communities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
