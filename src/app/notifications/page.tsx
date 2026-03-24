import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Benachrichtigungen",
};

const notificationIcons: Record<string, string> = {
  like: "❤️",
  comment: "💬",
  follow: "👤",
  mention: "@",
  community_post: "🏘️",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return (
    <div className="container-narrow py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Benachrichtigungen</h1>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p>Keine Benachrichtigungen vorhanden</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 ${!n.read ? "bg-mesh-50" : ""}`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">
                {notificationIcons[n.type] ?? "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  {n.message ?? n.type}
                </p>
                {n.referenceId && (
                  <Link
                    href={`/posts/${n.referenceId}`}
                    className="text-xs link mt-0.5 block"
                  >
                    Post ansehen →
                  </Link>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 bg-mesh-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
