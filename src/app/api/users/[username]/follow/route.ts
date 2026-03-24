import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "Du kannst dir nicht selbst folgen" }, { status: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return NextResponse.json({ isFollowing: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      });

      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          type: "follow",
          referenceId: session.user.id,
          message: `@${session.user.username} folgt dir jetzt`,
        },
      });

      return NextResponse.json({ isFollowing: true });
    }
  } catch (error) {
    console.error("POST /api/users/[username]/follow error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
