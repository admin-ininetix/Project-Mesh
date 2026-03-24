"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getAvatarUrl } from "@/lib/utils";
import type { CommentWithAuthor } from "@/types";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setContent("");
        toast.success("Kommentar veröffentlicht!");
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Fehler");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Kommentar löschen?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
        toast.success("Kommentar gelöscht");
      }
    } catch {
      toast.error("Fehler");
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        {comments.length} Kommentar{comments.length !== 1 ? "e" : ""}
      </h3>

      {/* Comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Image
            src={getAvatarUrl(session.user.image, session.user.username ?? "user")}
            alt={session.user.name ?? "User"}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe einen Kommentar..."
              className="textarea w-full"
              rows={2}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">{content.length}/1000</span>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="btn btn-primary btn-sm"
              >
                {submitting ? "..." : "Kommentieren"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 text-sm text-gray-500">
          <Link href="/login" className="link">Anmelden</Link> um zu kommentieren
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((comment) => {
          if (comment.deletedAt) {
            return (
              <div key={comment.id} className="text-sm text-gray-400 italic pl-12">
                [Kommentar gelöscht]
              </div>
            );
          }

          const displayName = comment.author.profile?.displayName ?? comment.author.username;
          const avatarUrl = getAvatarUrl(comment.author.profile?.avatarUrl, comment.author.username);

          return (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/u/${comment.author.username}`} className="flex-shrink-0">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/u/${comment.author.username}`}
                      className="text-sm font-medium text-gray-900 hover:text-mesh-600"
                    >
                      {displayName}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {session?.user?.id === comment.author.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Löschen
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-6">
          Noch keine Kommentare. Sei der Erste!
        </p>
      )}
    </div>
  );
}
