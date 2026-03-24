import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const community = await prisma.community.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    })
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    const membership = await prisma.communityMembership.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
        role: 'MEMBER',
      },
    })

    return NextResponse.json({ membership }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }
    console.error('POST /api/communities/[id]/join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const community = await prisma.community.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    })
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    await prisma.communityMembership.deleteMany({
      where: {
        userId: session.user.id,
        communityId: community.id,
        role: { not: 'OWNER' },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/communities/[id]/join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
