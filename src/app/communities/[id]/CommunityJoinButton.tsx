'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Props {
  communityId: string
  communitySlug: string
}

export function CommunityJoinButton({ communityId, communitySlug }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setChecking(false)
      return
    }

    fetch(`/api/communities/${communitySlug}`)
      .then((r) => r.json())
      .then((data) => {
        setIsMember(data.community?.isMember ?? false)
      })
      .finally(() => setChecking(false))
  }, [session, communitySlug])

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push('/login')}
      >
        Join
      </Button>
    )
  }

  async function handleToggle() {
    if (loading) return
    setLoading(true)

    try {
      const method = isMember ? 'DELETE' : 'POST'
      const res = await fetch(`/api/communities/${communityId}/join`, { method })

      if (res.ok) {
        setIsMember(!isMember)
        router.refresh()
      }
    } catch (err) {
      console.error('Join/leave error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return <Button variant="secondary" size="sm" loading>Loading...</Button>
  }

  return (
    <Button
      variant={isMember ? 'secondary' : 'primary'}
      size="sm"
      onClick={handleToggle}
      loading={loading}
    >
      {isMember ? 'Leave' : 'Join'}
    </Button>
  )
}
