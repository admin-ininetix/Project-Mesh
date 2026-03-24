import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          Mesh
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
