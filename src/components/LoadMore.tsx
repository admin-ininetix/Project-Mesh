"use client";

import { useState, useCallback } from "react";
import type { PostWithAuthor } from "@/types";
import { PostCard } from "./PostCard";

interface LoadMorePostsProps {
  initialPosts: PostWithAuthor[];
  fetchUrl: string;
  pageSize?: number;
}

export function LoadMorePosts({ initialPosts, fetchUrl, pageSize = 10 }: LoadMorePostsProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length === pageSize);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const url = `${fetchUrl}${fetchUrl.includes("?") ? "&" : "?"}page=${page + 1}&pageSize=${pageSize}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newPosts: PostWithAuthor[] = data.data ?? [];
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((p) => p + 1);
        setHasMore(data.hasMore ?? newPosts.length === pageSize);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, loading, hasMore, page, pageSize]);

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
      {posts.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg">Noch keine Posts</p>
          <p className="text-sm mt-1">Sei der Erste und erstelle einen Post!</p>
        </div>
      )}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? "Lädt..." : "Mehr laden"}
          </button>
        </div>
      )}
    </div>
  );
}
