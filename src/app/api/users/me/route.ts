import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        displayName: data.displayName,
        bio: data.bio,
        websiteUrl: data.websiteUrl || null,
        location: data.location,
        avatarUrl: data.avatarUrl,
      },
      create: {
        userId: session.user.id,
        displayName: data.displayName,
        bio: data.bio,
        websiteUrl: data.websiteUrl || null,
        location: data.location,
        avatarUrl: data.avatarUrl,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("PUT /api/users/me error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    // Soft delete
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletedAt: new Date(),
        email: `deleted_${session.user.id}@deleted.invalid`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users/me error:", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
