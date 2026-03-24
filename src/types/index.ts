import type { Role, ReportStatus, MembershipRole, NotificationType } from "@prisma/client";

export type { Role, ReportStatus, MembershipRole, NotificationType };

export interface UserSession {
  id: string;
  email: string;
  username: string;
  role: Role;
  name?: string | null;
  image?: string | null;
}

export interface PostWithAuthor {
  id: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  };
  community: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    likes: number;
    comments: number;
  };
  likedByUser?: boolean;
}

export interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  };
  _count: {
    likes: number;
  };
  likedByUser?: boolean;
}

export interface CommunityWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  banner: string | null;
  createdAt: Date;
  _count: {
    memberships: number;
    posts: number;
  };
  isMember?: boolean;
}

export interface ProfileWithUser {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  banner: string | null;
  user: {
    id: string;
    username: string;
    role: Role;
    createdAt: Date;
    _count: {
      posts: number;
      followers: number;
      following: number;
    };
  };
  isFollowing?: boolean;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
