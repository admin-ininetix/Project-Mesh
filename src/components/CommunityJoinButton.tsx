"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CommunityJoinButtonProps {
  slug: string;
  initialIsMember: boolean;
}

export function CommunityJoinButton({ slug, initialIsMember }: CommunityJoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsMember(data.isMember);
        toast.success(data.isMember ? "Community beigetreten!" : "Community verlassen");
        router.refresh();
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
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn btn-sm ${isMember ? "btn-secondary border-red-200 text-red-600 hover:bg-red-50" : "btn-primary"}`}
    >
      {loading ? "..." : isMember ? "Verlassen" : "Beitreten"}
    </button>
  );
}
