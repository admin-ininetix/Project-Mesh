"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AdminUserRoleSelectProps {
  userId: string;
  currentRole: string;
}

export function AdminUserRoleSelect({ userId, currentRole }: AdminUserRoleSelectProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newRole: string) {
    if (loading || newRole === role) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setRole(newRole);
        toast.success(`Rolle auf "${newRole}" geändert`);
        router.refresh();
      } else {
        toast.error("Fehler beim Ändern der Rolle");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs border border-gray-200 rounded px-1 py-0.5 disabled:opacity-50"
    >
      {["user", "moderator", "admin"].map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
