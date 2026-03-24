"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface AdminReportItemProps {
  report: {
    id: string;
    reason: string;
    status: string;
    createdAt: Date;
    reporter: { username: string };
    post: { id: string; content: string; authorId: string } | null;
    comment: { id: string; content: string } | null;
  };
  onStatusChange?: (id: string) => void;
}

export function AdminReportItem({ report, onStatusChange }: AdminReportItemProps) {
  const [loading, setLoading] = useState(false);

  async function handleAction(status: string) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, status }),
      });
      if (res.ok) {
        toast.success(status === "resolved" ? "Meldung gelöst" : "Meldung abgelehnt");
        onStatusChange?.(report.id);
      } else {
        toast.error("Fehler beim Aktualisieren");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
      <span className="text-lg">🚨</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          Gemeldet von @{report.reporter.username}
        </p>
        <p className="text-sm text-gray-600">Grund: {report.reason}</p>
        {report.post && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            Post: {report.post.content.slice(0, 80)}...
          </p>
        )}
        {report.comment && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            Kommentar: {report.comment.content.slice(0, 80)}...
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{formatDate(report.createdAt)}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => handleAction("resolved")}
          disabled={loading}
          className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
        >
          Lösen
        </button>
        <button
          onClick={() => handleAction("dismissed")}
          disabled={loading}
          className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          Ablehnen
        </button>
      </div>
    </div>
  );
}
