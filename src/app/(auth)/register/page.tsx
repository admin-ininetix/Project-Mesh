'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setGlobalError(data.error || 'Registration failed')
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/login')
      } else {
        router.push('/feed')
        router.refresh()
      }
    } catch (err) {
      setGlobalError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="2" />
                <circle cx="5" cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
                <line x1="12" y1="7" x2="5" y2="17" />
                <line x1="12" y1="7" x2="19" y2="17" />
                <line x1="5" y1="19" x2="19" y2="19" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-text-primary">Project Mesh</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="p-6">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Join Project Mesh and start connecting.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Display Name"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Your Name"
                autoComplete="name"
                error={errors.displayName}
                required
              />
              <Input
                label="Username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="yourhandle"
                autoComplete="username"
                error={errors.username}
                helpText="Letters, numbers, underscores only. 3–30 chars."
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                error={errors.password}
                required
              />

              {globalError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-400">{globalError}</p>
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:text-text-secondary">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-text-secondary">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
