"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Registrierung fehlgeschlagen");
        return;
      }

      // Auto-login
      const loginRes = await signIn("credentials", {
        login: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginRes?.ok) {
        toast.success("Willkommen bei Project Mesh!");
        router.push("/settings");
      } else {
        toast.success("Registrierung erfolgreich! Bitte anmelden.");
        router.push("/login");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  const usernameValid = /^[a-z0-9_]{3,20}$/.test(form.username);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Konto erstellen</h1>
          <p className="text-gray-500 mt-2">Werde Teil von Project Mesh</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={`input ${form.username && !usernameValid ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                value={form.username}
                onChange={handleChange}
                placeholder="mustermann"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_]+"
                autoComplete="username"
              />
              {form.username && !usernameValid && (
                <p className="text-xs text-red-500 mt-1">
                  Nur Kleinbuchstaben, Zahlen, Unterstrich. 3-20 Zeichen.
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="email">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={form.email}
                onChange={handleChange}
                placeholder="max@beispiel.de"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                value={form.password}
                onChange={handleChange}
                placeholder="Mindestens 8 Zeichen"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">
                Passwort wiederholen
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`input ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-red-300"
                    : ""
                }`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="text-xs text-gray-500">
              Mit der Registrierung stimmst du unserer{" "}
              <Link href="/datenschutz" className="link">
                Datenschutzerklärung
              </Link>{" "}
              zu.
            </div>

            <button
              type="submit"
              disabled={loading || !usernameValid}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? "Erstelle Account..." : "Account erstellen"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Bereits registriert?{" "}
          <Link href="/login" className="link font-medium">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
