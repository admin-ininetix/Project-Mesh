export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  createdAt: string
  _count?: {
    posts: number
    followers: number
    following: number
  }
}

export interface Post {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    role: string
  }
  community: {
    id: string
    name: string
    slug: string
  } | null
  _count: {
    comments: number
    likes: number
  }
  isLiked?: boolean
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
}

export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  _count: {
    members: number
    posts: number
  }
  isMember?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ApiError {
  error: string
  details?: unknown
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      displayName: string
      avatarUrl: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    role: string
  }
}
