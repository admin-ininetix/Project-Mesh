import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null, published: true },
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
    });

    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({
      ...post,
      likedByUser: session
        ? (post as typeof post & { likes?: { id: string }[] }).likes?.length > 0
        : false,
      likes: undefined,
    });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    const isAuthorOrAdmin =
      post.authorId === session.user.id ||
      session.user.role === "admin" ||
      session.user.role === "moderator";

    if (!isAuthorOrAdmin) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
      select: { authorId: true },
    });

    if (!post || post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.post.update({
      where: { id },
      data: {
        content: body.content,
        published: body.published,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
