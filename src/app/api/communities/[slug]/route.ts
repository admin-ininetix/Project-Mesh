import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  try {
    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        _count: { select: { memberships: true, posts: true } },
        ...(session
          ? {
              memberships: {
                where: { userId: session.user.id },
                select: { id: true, role: true },
              },
            }
          : {}),
      },
    });

    if (!community) {
      return NextResponse.json({ error: "Community nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({
      ...community,
      isMember:
        (community as typeof community & { memberships?: { id: string }[] }).memberships
          ?.length > 0,
    });
  } catch (error) {
    console.error("GET /api/communities/[slug] error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
