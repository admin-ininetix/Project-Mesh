import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoadMorePosts } from "@/components/LoadMore";
import Image from "next/image";
import Link from "next/link";
import type { PostWithAuthor } from "@/types";
import { CommunityJoinButton } from "@/components/CommunityJoinButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) return { title: "Community nicht gefunden" };

  return {
    title: `c/${community.name}`,
    description: community.description ?? `Community: ${community.name}`,
    openGraph: {
      title: `c/${community.name} | Project Mesh`,
      description: community.description ?? "",
      images: community.imageUrl ? [community.imageUrl] : [],
    },
  };
}

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

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

  if (!community) notFound();

  const posts = await prisma.post.findMany({
    where: { communityId: community.id, published: true, deletedAt: null },
    take: 10,
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
  });

  const communityData = community as typeof community & {
    memberships?: { id: string; role: string }[];
  };
  const isMember = (communityData.memberships?.length ?? 0) > 0;

  const postsData: PostWithAuthor[] = posts.map((p) => ({
    ...p,
    likedByUser: session
      ? (p as typeof p & { likes?: { id: string }[] }).likes?.length > 0
      : false,
  }));

  return (
    <div className="container-wide py-8">
      {/* Community Header */}
      <div className="card overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-mesh-500 to-mesh-700 relative">
          {community.banner && (
            <Image src={community.banner} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="p-6 -mt-8">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden">
              {community.imageUrl ? (
                <Image
                  src={community.imageUrl}
                  alt={community.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-mesh-100 flex items-center justify-center">
                  <span className="text-mesh-600 font-bold text-2xl">
                    {community.name[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 mt-8">
              <h1 className="text-2xl font-bold text-gray-900">c/{community.name}</h1>
              {community.description && (
                <p className="text-gray-600 mt-1">{community.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {community._count.memberships.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Mitglieder</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {community._count.posts.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              {session ? (
                <CommunityJoinButton slug={slug} initialIsMember={isMember} />
              ) : (
                <Link href="/login" className="btn btn-primary">
                  Beitreten
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {session && (
            <div className="mb-4">
              <Link
                href={`/create?community=${slug}`}
                className="btn btn-primary w-full"
              >
                Post in c/{community.name} erstellen
              </Link>
            </div>
          )}
          <LoadMorePosts
            initialPosts={postsData}
            fetchUrl={`/api/posts?communitySlug=${slug}`}
            pageSize={10}
          />
        </div>
        <aside className="hidden lg:block">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Über diese Community</h3>
            {community.description && (
              <p className="text-sm text-gray-600 mb-3">{community.description}</p>
            )}
            <div className="text-sm text-gray-500">
              Erstellt am{" "}
              {new Date(community.createdAt).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
