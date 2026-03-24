import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CommunityCard } from "@/components/CommunityCard";
import Link from "next/link";
import type { CommunityWithCount } from "@/types";

export const metadata: Metadata = {
  title: "Communities",
  description: "Entdecke alle Communities auf Project Mesh",
};

export const revalidate = 120;

export default async function CommunitiesPage() {
  const session = await getServerSession(authOptions);

  const communities = await prisma.community.findMany({
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

  const communitiesData: CommunityWithCount[] = communities.map((c) => ({
    ...c,
    isMember:
      (c as typeof c & { memberships?: { id: string }[] }).memberships?.length > 0,
  }));

  return (
    <div className="container-wide py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
          <p className="text-gray-500 mt-1">
            {communities.length} Communities auf Project Mesh
          </p>
        </div>
        {session?.user?.role === "admin" && (
          <Link href="/admin/communities/create" className="btn btn-primary">
            Community erstellen
          </Link>
        )}
      </div>

      {communitiesData.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🏘️</p>
          <p>Noch keine Communities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {communitiesData.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
}
