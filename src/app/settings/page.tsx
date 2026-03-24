"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    websiteUrl: "",
    location: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setForm({
          displayName: data.profile?.displayName ?? "",
          bio: data.profile?.bio ?? "",
          websiteUrl: data.profile?.websiteUrl ?? "",
          location: data.profile?.location ?? "",
        });
      }
      setLoadingData(false);
    }
    if (session) loadProfile();
  }, [session]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar darf max. 2 MB groß sein");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          avatarUrl = data.url;
        }
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName || undefined,
          bio: form.bio || undefined,
          websiteUrl: form.websiteUrl || undefined,
          location: form.location || undefined,
          avatarUrl,
        }),
      });

      if (res.ok) {
        toast.success("Profil gespeichert!");
        await update();
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Fehler");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmation = prompt(
      'Möchtest du deinen Account wirklich löschen? Schreibe "LÖSCHEN" zur Bestätigung:'
    );
    if (confirmation !== "LÖSCHEN") return;

    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account gelöscht");
        await signOut({ callbackUrl: "/" });
      }
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  if (status === "loading" || loadingData) {
    return (
      <div className="container-narrow py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mesh-600" />
      </div>
    );
  }

  if (!session) return null;

  const currentAvatar = avatarPreview ?? getAvatarUrl(session.user.image, session.user.username);

  return (
    <div className="container-narrow py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Einstellungen</h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profilinformationen</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Image
                src={currentAvatar}
                alt="Avatar"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <label className="btn btn-secondary btn-sm cursor-pointer">
                  Avatar ändern
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max. 2 MB</p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="displayName">
                Anzeigename
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                className="input"
                value={form.displayName}
                onChange={handleChange}
                placeholder={session.user.username}
                maxLength={50}
              />
            </div>

            <div>
              <label className="label" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="textarea w-full"
                rows={3}
                value={form.bio}
                onChange={handleChange}
                placeholder="Erzähl etwas über dich..."
                maxLength={500}
              />
            </div>

            <div>
              <label className="label" htmlFor="location">
                Ort
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="input"
                value={form.location}
                onChange={handleChange}
                placeholder="Berlin, Deutschland"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label" htmlFor="websiteUrl">
                Website
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                className="input"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="pt-2">
              <div className="text-sm text-gray-500 mb-2">
                <strong>Benutzername:</strong> @{session.user.username}
              </div>
              <div className="text-sm text-gray-500">
                <strong>E-Mail:</strong> {session.user.email}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Speichere..." : "Speichern"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-red-200">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Gefahrenzone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Das Löschen deines Accounts ist unwiderruflich. Alle deine Daten werden gelöscht.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="btn btn-danger btn-sm"
          >
            Account löschen
          </button>
        </div>
      </div>
    </div>
  );
}
