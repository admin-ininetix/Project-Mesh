import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  communityId: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const username = searchParams.get("username");
  const communitySlug = searchParams.get("communitySlug");

  try {
    let communityId: string | undefined;
    if (communitySlug) {
      const community = await prisma.community.findUnique({
        where: { slug: communitySlug },
        select: { id: true },
      });
      communityId = community?.id;
    }

    const where = {
      published: true,
      deletedAt: null as null | undefined,
      ...(username
        ? { author: { username } }
        : {}),
      ...(communityId
        ? { communityId }
        : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
          community: { select: { id: true, name: true, slug: true } },
          _count: { select: { likes: true, comments: true } },
          ...(session
            ? { likes: { where: { userId: session.user.id }, select: { id: true } } }
            : {}),
        },
      }),
      prisma.post.count({ where }),
    ]);

    const postsWithLiked = posts.map((p) => ({
      ...p,
      likedByUser: session
        ? (p as typeof p & { likes?: { id: string }[] }).likes?.length > 0
        : false,
      likes: undefined,
    }));

    return NextResponse.json({
      data: postsWithLiked,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, communityId, imageUrl } = parsed.data;

    // Verify community membership if communityId provided
    if (communityId) {
      const membership = await prisma.communityMembership.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId,
          },
        },
      });
      if (!membership) {
        return NextResponse.json(
          { error: "Du bist kein Mitglied dieser Community" },
          { status: 403 }
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        communityId: communityId ?? null,
        imageUrl: imageUrl ?? null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        community: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ ...post, likedByUser: false }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
