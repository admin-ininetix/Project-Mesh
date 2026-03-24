import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoadMorePosts } from "@/components/LoadMore";
import Image from "next/image";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";
import { FollowButton } from "@/components/FollowButton";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
    include: { profile: true },
  });
  if (!user) return { title: "Nutzer nicht gefunden" };

  const displayName = user.profile?.displayName ?? user.username;
  return {
    title: `${displayName} (@${user.username})`,
    description: user.profile?.bio ?? `${displayName} auf Project Mesh`,
    openGraph: {
      title: `${displayName} (@${user.username}) | Project Mesh`,
      description: user.profile?.bio ?? "",
      images: user.profile?.avatarUrl ? [user.profile.avatarUrl] : [],
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
    include: {
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

  if (!user) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id, published: true, deletedAt: null },
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

  const userData = user as typeof user & { followers?: { id: string }[] };
  const isFollowing = (userData.followers?.length ?? 0) > 0;
  const isOwnProfile = session?.user?.id === user.id;
  const displayName = user.profile?.displayName ?? user.username;
  const avatarUrl = getAvatarUrl(user.profile?.avatarUrl, user.username);

  const postsData: PostWithAuthor[] = posts.map((p) => ({
    ...p,
    likedByUser: session
      ? (p as typeof p & { likes?: { id: string }[] }).likes?.length > 0
      : false,
  }));

  return (
    <div className="container-wide py-8">
      {/* Profile Header */}
      <div className="card overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-mesh-400 to-mesh-600 relative">
          {user.profile?.banner && (
            <Image src={user.profile.banner} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="p-6 -mt-12">
          <div className="flex items-end gap-4 flex-wrap">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div className="flex-1 min-w-0 mt-12">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                {user.role === "admin" && (
                  <span className="badge badge-primary">Admin</span>
                )}
                {user.role === "moderator" && (
                  <span className="badge badge-gray">Mod</span>
                )}
              </div>
              <p className="text-gray-500">@{user.username}</p>
              {user.profile?.bio && (
                <p className="text-gray-700 mt-2">{user.profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                <span>{user._count.posts} Posts</span>
                <span>{user._count.followers} Follower</span>
                <span>{user._count.following} Folgt</span>
                {user.profile?.location && <span>📍 {user.profile.location}</span>}
                {user.profile?.websiteUrl && (
                  <a
                    href={user.profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    🔗 {user.profile.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
            <div className="mt-12">
              {isOwnProfile ? (
                <Link href="/settings" className="btn btn-secondary">
                  Profil bearbeiten
                </Link>
              ) : session ? (
                <FollowButton username={username} initialIsFollowing={isFollowing} />
              ) : (
                <Link href="/login" className="btn btn-primary">
                  Folgen
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-2xl">
        <h2 className="font-semibold text-gray-900 mb-4">Posts von {displayName}</h2>
        <LoadMorePosts
          initialPosts={postsData}
          fetchUrl={`/api/posts?username=${username}`}
          pageSize={10}
        />
      </div>
    </div>
  );
}
