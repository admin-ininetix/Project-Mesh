"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { CommunityWithCount } from "@/types";
import toast from "react-hot-toast";

interface CommunityCardProps {
  community: CommunityWithCount;
  onJoinToggle?: (slug: string, isMember: boolean) => void;
}

export function CommunityCard({ community, onJoinToggle }: CommunityCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMember, setIsMember] = useState(community.isMember ?? false);
  const [memberCount, setMemberCount] = useState(community._count.memberships);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/communities/${community.slug}/join`, {
        method: "POST",
      });
      if (res.ok) {
        const newIsMember = !isMember;
        setIsMember(newIsMember);
        setMemberCount(newIsMember ? memberCount + 1 : memberCount - 1);
        onJoinToggle?.(community.slug, newIsMember);
        toast.success(newIsMember ? "Beigetreten!" : "Community verlassen");
      } else {
        toast.error("Fehler");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner */}
      <div className="h-16 bg-gradient-to-r from-mesh-500 to-mesh-700 relative">
        {community.banner && (
          <Image src={community.banner} alt="" fill className="object-cover" />
        )}
      </div>

      <div className="p-4 -mt-6">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl border-4 border-white bg-white shadow-sm overflow-hidden mb-2">
          {community.imageUrl ? (
            <Image
              src={community.imageUrl}
              alt={community.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-mesh-100 flex items-center justify-center">
              <span className="text-mesh-600 font-bold text-lg">
                {community.name[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <Link href={`/c/${community.slug}`} className="hover:underline">
          <h3 className="font-semibold text-gray-900 text-sm">
            c/{community.name}
          </h3>
        </Link>

        {community.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {community.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{memberCount.toLocaleString()} Mitglieder</span>
          <span>{community._count.posts.toLocaleString()} Posts</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className={`mt-3 w-full btn btn-sm ${
            isMember
              ? "btn-secondary border-red-200 text-red-600 hover:bg-red-50"
              : "btn-primary"
          }`}
        >
          {loading ? "..." : isMember ? "Verlassen" : "Beitreten"}
        </button>
      </div>
    </div>
  );
}
