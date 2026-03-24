'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({
    displayName: session?.user?.displayName || '',
    bio: '',
    avatarUrl: session?.user?.avatarUrl || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update profile')
        return
      }

      setSuccess('Profile updated successfully!')
      await update()
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and profile.</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="p-6">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                src={form.avatarUrl}
                alt={session!.user.displayName}
                size="xl"
              />
              <div>
                <p className="font-semibold text-text-primary">{session!.user.displayName}</p>
                <p className="text-sm text-text-muted">@{session!.user.username}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Display Name"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Your display name"
                maxLength={50}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Bio</label>
                <Textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell people a bit about yourself..."
                  rows={3}
                  maxLength={300}
                />
              </div>

              <Input
                label="Avatar URL"
                name="avatarUrl"
                type="url"
                value={form.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                helpText="Link to an image for your profile picture."
              />

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader className="p-6">
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Username</p>
                <p className="text-sm text-text-muted">@{session!.user.username}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Email</p>
                <p className="text-sm text-text-muted">{session!.user.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Role</p>
                <p className="text-sm text-text-muted capitalize">{session!.user.role?.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
