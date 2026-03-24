import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const community = await prisma.community.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
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

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    let isMember = false
    if (session?.user?.id) {
      const membership = await prisma.communityMembership.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: community.id,
          },
        },
      })
      isMember = !!membership
    }

    return NextResponse.json({ community: { ...community, isMember } })
  } catch (error) {
    console.error('GET /api/communities/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
