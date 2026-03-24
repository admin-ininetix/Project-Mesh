import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoadMorePosts } from "@/components/LoadMore";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Feed – Project Mesh",
  description: "Die neuesten Posts aus der Project Mesh Community",
};

export const revalidate = 60;

async function getPosts(session: { user: { id: string } } | null) {
  const posts = await prisma.post.findMany({
    where: { published: true, deletedAt: null },
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
        ? {
            likes: {
              where: { userId: session.user.id },
              select: { id: true },
            },
          }
        : {}),
    },
  });

  return posts.map((post) => ({
    ...post,
    likedByUser: session
      ? (post as typeof post & { likes?: { id: string }[] }).likes?.length > 0
      : false,
    likes: undefined,
  }));
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts(session);

  return (
    <div className="container-wide py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create post CTA */}
          {session ? (
            <div className="card p-4 flex items-center gap-3">
              <div className="flex-1">
                <Link
                  href="/create"
                  className="block w-full text-left text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm transition-colors"
                >
                  Was denkst du, {session.user.name ?? session.user.username}?
                </Link>
              </div>
              <Link href="/create" className="btn btn-primary btn-sm flex-shrink-0">
                Post
              </Link>
            </div>
          ) : null}

          <LoadMorePosts
            initialPosts={posts as Parameters<typeof LoadMorePosts>[0]["initialPosts"]}
            fetchUrl="/api/posts"
            pageSize={10}
          />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
