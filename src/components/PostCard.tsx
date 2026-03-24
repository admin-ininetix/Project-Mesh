"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDate, getAvatarUrl } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";
import toast from "react-hot-toast";

interface PostCardProps {
  post: PostWithAuthor;
  onDelete?: (id: string) => void;
  showCommunity?: boolean;
}

export function PostCard({ post, onDelete, showCommunity = true }: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(post._count.likes);
  const [liked, setLiked] = useState(post.likedByUser ?? false);
  const [loading, setLoading] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const isAuthor = session?.user?.id === post.author.id;

  async function handleLike() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    const prev = liked;
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(prev);
        setLikes(prev ? likes - 1 : likes + 1);
      }
    } catch {
      setLiked(prev);
      setLikes(likes);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Post wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post gelöscht");
        onDelete?.(post.id);
      } else {
        toast.error("Fehler beim Löschen");
      }
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleReport() {
    if (!session) {
      router.push("/login");
      return;
    }
    const reason = prompt("Warum möchtest du diesen Post melden?");
    if (!reason) return;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, reason }),
      });
      if (res.ok) toast.success("Meldung eingereicht");
      else toast.error("Fehler beim Melden");
    } catch {
      toast.error("Fehler beim Melden");
    }
    setShowReportMenu(false);
  }

  const displayName = post.author.profile?.displayName ?? post.author.username;
  const avatarUrl = getAvatarUrl(post.author.profile?.avatarUrl, post.author.username);

  if (post.deletedAt) {
    return (
      <div className="card p-4 text-gray-400 text-sm italic">
        [Dieser Post wurde gelöscht]
      </div>
    );
  }

  return (
    <article className="card overflow-hidden hover:shadow-md transition-shadow">
      {/* Community badge */}
      {showCommunity && post.community && (
        <div className="px-4 pt-3 pb-0">
          <Link
            href={`/c/${post.community.slug}`}
            className="text-xs font-medium text-mesh-600 hover:text-mesh-700 hover:underline"
          >
            c/{post.community.name}
          </Link>
        </div>
      )}

      <div className="p-4">
        {/* Author */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/u/${post.author.username}`} className="flex items-center gap-2 group">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-mesh-200 transition-all"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-mesh-600 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">
                @{post.author.username} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>

          {/* Options menu */}
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>
            {showReportMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {isAuthor ? (
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Post löschen
                  </button>
                ) : (
                  <button
                    onClick={handleReport}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Melden
                  </button>
                )}
                <button
                  onClick={() => setShowReportMenu(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  Schließen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <Link href={`/posts/${post.id}`}>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3 hover:text-gray-900">
            {post.content}
          </p>
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden mb-3 bg-gray-100">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={600}
                height={400}
                className="w-full object-cover max-h-96"
              />
            </div>
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={liked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likes}</span>
          </button>

          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-mesh-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post._count.comments}</span>
          </Link>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
              toast.success("Link kopiert!");
            }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-mesh-600 transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
