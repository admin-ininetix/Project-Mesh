'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'
import { Button } from '@/components/ui/Button'
import type { Post } from '@/types'

export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchPosts = useCallback(async (cursor?: string) => {
    try {
      const url = cursor ? `/api/posts?cursor=${cursor}` : '/api/posts'
      const res = await fetch(url)
      const data = await res.json()

      if (cursor) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts || [])
      }
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts().finally(() => setLoading(false))
    }
  }, [status, fetchPosts])

  async function loadMore() {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    await fetchPosts(nextCursor)
    setLoadingMore(false)
  }

  function handlePostCreated() {
    fetchPosts()
  }

  function handlePostDeleted(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  if (status === 'loading' || (status === 'unauthenticated')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <PostComposer onPostCreated={handlePostCreated} />

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🌐</div>
              <p className="text-text-secondary text-lg mb-2">Your feed is empty</p>
              <p className="text-text-muted text-sm">
                Start by following people or joining communities.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handlePostDeleted}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="secondary"
                    onClick={loadMore}
                    loading={loadingMore}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <Sidebar />
      </main>
    </>
  )
}

function PostSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-border shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-border rounded" />
          <div className="h-3 w-24 bg-border rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-border rounded" />
        <div className="h-3 w-3/4 bg-border rounded" />
      </div>
    </div>
  )
}
