import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { CommentSection } from "@/components/CommentSection";
import Link from "next/link";
import type { PostWithAuthor, CommentWithAuthor } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
    include: { author: { select: { username: true } } },
  });
  if (!post) return { title: "Post nicht gefunden" };

  const excerpt = post.content.slice(0, 150);
  return {
    title: `Post von @${post.author.username}`,
    description: excerpt,
    openGraph: {
      title: `Post von @${post.author.username}`,
      description: excerpt,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
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

  if (!post) notFound();

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      _count: { select: { likes: true } },
    },
  });

  const postData: PostWithAuthor = {
    ...post,
    likedByUser: session
      ? (post as typeof post & { likes?: { id: string }[] }).likes?.length > 0
      : false,
  };

  const commentsData: CommentWithAuthor[] = comments.map((c) => ({
    ...c,
    likedByUser: false,
  }));

  return (
    <div className="container-narrow py-8">
      <nav className="mb-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Zurück
        </Link>
      </nav>
      <div className="space-y-6">
        <PostCard post={postData} />
        <div className="card p-6">
          <CommentSection postId={id} initialComments={commentsData} />
        </div>
      </div>
    </div>
  );
}
