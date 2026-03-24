'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

interface PostComposerProps {
  communityId?: string
  onPostCreated?: () => void
  placeholder?: string
}

const MAX_CHARS = 500

export function PostComposer({ communityId, onPostCreated, placeholder }: PostComposerProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!session) return null

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEmpty || isOverLimit || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: imageUrl.trim() || undefined,
          communityId: communityId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create post')
        return
      }

      setContent('')
      setImageUrl('')
      setShowImageInput(false)
      onPostCreated?.()
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar
            src={session.user.avatarUrl}
            alt={session.user.displayName}
            size="md"
            className="shrink-0 mt-1"
          />
          <div className="flex-1 min-w-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder || "What's on your mind?"}
              rows={3}
              className="text-base border-0 bg-transparent px-0 focus:ring-0 resize-none"
              maxLength={MAX_CHARS + 50}
            />

            {showImageInput && (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL (https://...)"
                className="w-full mt-2 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            )}

            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                  title="Add image URL"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${
                  isOverLimit ? 'text-red-400' : remaining < 50 ? 'text-yellow-400' : 'text-text-muted'
                }`}>
                  {remaining}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  loading={loading}
                  disabled={isEmpty || isOverLimit}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
