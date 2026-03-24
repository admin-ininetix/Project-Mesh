import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Seite nicht gefunden",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-mesh-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seite nicht gefunden</h1>
        <p className="text-gray-500 mb-6">
          Die Seite, die du suchst, existiert nicht oder wurde verschoben.
        </p>
        <Link href="/" className="btn btn-primary">
          Zurück zum Feed
        </Link>
      </div>
    </div>
  );
}
