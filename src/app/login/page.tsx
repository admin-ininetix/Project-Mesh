"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login || !password) return;
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        login,
        password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Willkommen zurück!");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Falsche Anmeldedaten");
      }
    } catch {
      toast.error("Fehler beim Anmelden");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Willkommen zurück</h1>
          <p className="text-gray-500 mt-2">Melde dich bei Project Mesh an</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="login">
                E-Mail oder Benutzername
              </label>
              <input
                id="login"
                type="text"
                className="input"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="deine@email.de oder username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !login || !password}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Noch kein Account?{" "}
          <Link href="/register" className="link font-medium">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
