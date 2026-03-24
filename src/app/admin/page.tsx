import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { AdminReportItem } from "@/components/AdminReportItem";
import { AdminUserRoleSelect } from "@/components/AdminUserRoleSelect";

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

  const recentUsers =
    session.user.role === "admin"
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
          <PendingReportsList reports={pendingReports} />
        )}
      </div>

      {/* User Management (admin only) */}
      {session.user.role === "admin" && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Neueste Nutzer</h2>
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
                      <AdminUserRoleSelect userId={user.id} currentRole={user.role} />
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

function PendingReportsList({
  reports,
}: {
  reports: {
    id: string;
    reason: string;
    status: string;
    createdAt: Date;
    reporter: { username: string };
    post: { id: string; content: string; authorId: string } | null;
    comment: { id: string; content: string } | null;
  }[];
}) {
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <AdminReportItem key={report.id} report={report} />
      ))}
    </div>
  );
}
