import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function Sidebar() {
  const communities = await prisma.community.findMany({
    take: 5,
    orderBy: { memberships: { _count: "desc" } },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <aside className="space-y-4">
      {/* About */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Willkommen bei Project Mesh</h3>
        <p className="text-sm text-gray-600">
          Eine offene Community-Plattform. Lies alles ohne Account, oder{" "}
          <Link href="/register" className="link">
            registriere dich
          </Link>{" "}
          für volle Teilnahme.
        </p>
        <div className="mt-3 space-y-2">
          <Link href="/register" className="btn btn-primary w-full">
            Jetzt mitmachen
          </Link>
          <Link href="/login" className="btn btn-secondary w-full">
            Anmelden
          </Link>
        </div>
      </div>

      {/* Top Communities */}
      {communities.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Top Communities</h3>
          <div className="space-y-2">
            {communities.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-mesh-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-mesh-600 text-xs font-bold">
                    {c.name[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    c/{c.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c._count.memberships} Mitglieder
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/communities" className="block mt-3 text-xs text-center link">
            Alle Communities →
          </Link>
        </div>
      )}
    </aside>
  );
}
