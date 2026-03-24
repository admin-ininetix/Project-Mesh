import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  try {
    const user = await prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        profile: true,
        _count: {
          select: { posts: true, followers: true, following: true },
        },
        ...(session
          ? {
              followers: {
                where: { followerId: session.user.id },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      isFollowing:
        (user as typeof user & { followers?: { id: string }[] }).followers?.length > 0,
      followers: undefined,
    });
  } catch (error) {
    console.error("GET /api/users/[username] error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
