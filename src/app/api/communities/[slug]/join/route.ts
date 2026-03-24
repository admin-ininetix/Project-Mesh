import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json({ error: "Community nicht gefunden" }, { status: 404 });
    }

    const existing = await prisma.communityMembership.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: community.id,
        },
      },
    });

    if (existing) {
      await prisma.communityMembership.delete({ where: { id: existing.id } });
      return NextResponse.json({ isMember: false });
    } else {
      await prisma.communityMembership.create({
        data: {
          userId: session.user.id,
          communityId: community.id,
          role: "member",
        },
      });
      return NextResponse.json({ isMember: true });
    }
  } catch (error) {
    console.error("POST /api/communities/[slug]/join error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
