"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Etwas ist schiefgelaufen</h2>
        <p className="text-gray-500 mb-6 text-sm">
          {error.message ?? "Ein unbekannter Fehler ist aufgetreten."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary">
            Erneut versuchen
          </button>
          <Link href="/" className="btn btn-secondary">
            Zum Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
