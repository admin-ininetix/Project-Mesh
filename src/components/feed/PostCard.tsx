'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatDate, formatCount } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  onDelete?: (id: string) => void
  onLike?: (id: string, liked: boolean) => void
  showCommunity?: boolean
}

export function PostCard({ post, onDelete, onLike, showCommunity = true }: PostCardProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const isOwner = session?.user?.id === post.author.id
  const isMod = session?.user?.role === 'MODERATOR' || session?.user?.role === 'ADMIN'

  async function handleLike() {
    if (!session) return
    if (likeLoading) return
    setLikeLoading(true)

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      })
      if (res.ok) {
        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
        onLike?.(post.id, !isLiked)
      }
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setLikeLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete?.(post.id)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
    setShowMenu(false)
  }

  return (
    <article className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link
          href={`/profile/${post.author.username}`}
          className="flex items-center gap-3 min-w-0 flex-1 group"
        >
          <Avatar
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            size="md"
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text-primary text-sm group-hover:text-accent transition-colors truncate">
                {post.author.displayName}
              </span>
              {post.author.role !== 'USER' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  post.author.role === 'ADMIN'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {post.author.role.toLowerCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted flex-wrap">
              <span>@{post.author.username}</span>
              <span>·</span>
              <time>{formatDate(post.createdAt)}</time>
              {showCommunity && post.community && (
                <>
                  <span>·</span>
                  <Link
                    href={`/communities/${post.community.slug}`}
                    className="text-accent hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.community.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Menu */}
        {(isOwner || isMod) && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-surface border border-border rounded-xl shadow-xl py-1 z-10">
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-surface-hover"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/posts/${post.id}`} className="block">
        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={!session || likeLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isLiked
              ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
              : 'text-text-muted hover:text-red-400 hover:bg-red-400/10'
          } disabled:cursor-not-allowed`}
          title={!session ? 'Sign in to like' : ''}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <Link
          href={`/posts/${post.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{formatCount(post._count.comments)}</span>
        </Link>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/posts/${post.id}`)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-accent hover:bg-accent/10 transition-colors ml-auto"
          title="Copy link"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </article>
  )
}
