import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createCommunitySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const joined = searchParams.get("joined") === "true";

  try {
    const where = joined && session
      ? { memberships: { some: { userId: session.user.id } } }
      : {};

    const communities = await prisma.community.findMany({
      where,
      orderBy: { memberships: { _count: "desc" } },
      include: {
        _count: { select: { memberships: true, posts: true } },
        ...(session
          ? {
              memberships: {
                where: { userId: session.user.id },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    const data = communities.map((c) => ({
      ...c,
      isMember:
        (c as typeof c & { memberships?: { id: string }[] }).memberships?.length > 0,
    }));

    return NextResponse.json({ data, total: communities.length });
  } catch (error) {
    console.error("GET /api/communities error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createCommunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, imageUrl } = parsed.data;
    const slug = slugify(name);

    const existing = await prisma.community.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Community-Slug bereits vergeben" }, { status: 409 });
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        memberships: {
          create: {
            userId: session.user.id,
            role: "owner",
          },
        },
      },
      include: {
        _count: { select: { memberships: true, posts: true } },
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("POST /api/communities error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
