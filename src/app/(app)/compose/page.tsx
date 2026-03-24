'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'

const MAX_CHARS = 500

export default function ComposePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || isOverLimit || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: imageUrl.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create post')
        return
      }

      router.push(`/posts/${data.post.id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Create Post</h1>
          <p className="text-text-secondary text-sm mt-1">Share your thoughts with the world.</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex gap-4">
            <Avatar
              src={session!.user.avatarUrl}
              alt={session!.user.displayName}
              size="md"
              className="shrink-0"
            />
            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={5}
                className="text-base"
                autoFocus
              />

              {showImageInput && (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL (https://...)"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`p-2 rounded-lg transition-colors ${
                      showImageInput
                        ? 'text-accent bg-accent/10'
                        : 'text-text-muted hover:text-accent hover:bg-accent/10'
                    }`}
                    title="Add image URL"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-sm font-mono ${
                    isOverLimit ? 'text-red-400' : remaining < 50 ? 'text-yellow-400' : 'text-text-muted'
                  }`}>
                    {remaining} chars remaining
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!content.trim() || isOverLimit}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
