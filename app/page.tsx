import Header from "@/components/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-indigo-600 mb-4">
            Welcome to Mesh
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The social platform by Ininetix. Connect, share, and grow.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
            <a
              href="/auth/login"
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
