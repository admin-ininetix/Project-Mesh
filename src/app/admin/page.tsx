import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Panel",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "moderator") {
    redirect("/");
  }

  const [userCount, postCount, communityCount, pendingReports] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.community.count(),
    prisma.report.findMany({
      where: { status: "pending" },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { username: true } },
        post: { select: { id: true, content: true, authorId: true } },
        comment: { select: { id: true, content: true } },
      },
    }),
  ]);

  const recentUsers = session.user.role === "admin"
    ? await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })
    : [];

  return (
    <div className="container-wide py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Nutzer", value: userCount, icon: "👤" },
          { label: "Posts", value: postCount, icon: "📝" },
          { label: "Communities", value: communityCount, icon: "🏘️" },
          { label: "Offene Meldungen", value: pendingReports.length, icon: "🚨" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Reports */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Offene Meldungen ({pendingReports.length})
        </h2>
        {pendingReports.length === 0 ? (
          <p className="text-gray-400 text-sm">Keine offenen Meldungen ✓</p>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <ReportItem key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>

      {/* User Management (admin only) */}
      {session.user.role === "admin" && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Neueste Nutzer
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-2 font-medium text-gray-500">Nutzer</th>
                  <th className="pb-2 font-medium text-gray-500">E-Mail</th>
                  <th className="pb-2 font-medium text-gray-500">Rolle</th>
                  <th className="pb-2 font-medium text-gray-500">Registriert</th>
                  <th className="pb-2 font-medium text-gray-500">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2">
                      <Link href={`/u/${user.username}`} className="link font-medium">
                        @{user.username}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-500">{user.email}</td>
                    <td className="py-2">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-2 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="py-2">
                      <AdminUserActions userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "badge badge-primary",
    moderator: "badge badge-gray",
    user: "badge bg-green-100 text-green-700",
  };
  return <span className={styles[role] ?? "badge badge-gray"}>{role}</span>;
}

function ReportItem({
  report,
}: {
  report: {
    id: string;
    reason: string;
    status: string;
    createdAt: Date;
    reporter: { username: string };
    post: { id: string; content: string; authorId: string } | null;
    comment: { id: string; content: string } | null;
  };
}) {
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
      <ReportActions reportId={report.id} />
    </div>
  );
}

function ReportActions({ reportId }: { reportId: string }) {
  return (
    <div className="flex gap-2">
      <form action={`/api/admin/reports`} method="POST">
        <input type="hidden" name="id" value={reportId} />
        <input type="hidden" name="status" value="resolved" />
        <button
          type="submit"
          className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
          onClick={async (e) => {
            e.preventDefault();
            await fetch("/api/admin/reports", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: reportId, status: "resolved" }),
            });
            window.location.reload();
          }}
        >
          Lösen
        </button>
      </form>
      <button
        className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
        onClick={async () => {
          await fetch("/api/admin/reports", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: reportId, status: "dismissed" }),
          });
          window.location.reload();
        }}
      >
        Ablehnen
      </button>
    </div>
  );
}

function AdminUserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const roles = ["user", "moderator", "admin"];
  return (
    <select
      defaultValue={currentRole}
      className="text-xs border border-gray-200 rounded px-1 py-0.5"
      onChange={async (e) => {
        await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: e.target.value }),
        });
        window.location.reload();
      }}
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
