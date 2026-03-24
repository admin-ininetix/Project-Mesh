'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import type { Comment } from '@/types'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to post comment')
        return
      }

      setComments([...comments, data.comment])
      setContent('')
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Comments {comments.length > 0 && <span className="text-text-muted text-base">({comments.length})</span>}
      </h3>

      {/* Comment Input */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Avatar
              src={session.user.avatarUrl}
              alt={session.user.displayName}
              size="sm"
              className="shrink-0 mt-1"
            />
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                maxLength={300}
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  size="sm"
                  loading={submitting}
                  disabled={!content.trim()}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-surface border border-border rounded-xl text-center">
          <p className="text-text-secondary text-sm">
            <Link href="/login" className="text-accent hover:underline">Sign in</Link> to leave a comment.
          </p>
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-surface rounded" />
                <div className="h-3 w-48 bg-surface rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.author.username}`} className="shrink-0">
                <Avatar
                  src={comment.author.avatarUrl}
                  alt={comment.author.displayName}
                  size="sm"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="bg-surface-hover rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/profile/${comment.author.username}`}
                      className="text-sm font-semibold text-text-primary hover:text-accent transition-colors"
                    >
                      {comment.author.displayName}
                    </Link>
                    <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
