'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'

export function CreateCommunityButton() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!session) return null

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create community')
        return
      }

      setOpen(false)
      router.push(`/communities/${data.community.slug}`)
      router.refresh()
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        + Create Community
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-text-primary mb-4">Create Community</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Community Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Tech Talk"
                required
                maxLength={50}
                autoFocus
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Description</label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange as any}
                  placeholder="What's this community about?"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading} disabled={!form.name.trim()}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
