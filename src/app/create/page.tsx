"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Suspense } from "react";

function CreatePostForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const communitySlug = searchParams.get("community");

  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [communities, setCommunities] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadCommunities() {
      const res = await fetch("/api/communities?joined=true");
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.data ?? []);
        if (communitySlug) {
          const found = (data.data ?? []).find(
            (c: { slug: string }) => c.slug === communitySlug
          );
          if (found) setCommunityId(found.id);
        }
      }
    }
    if (session) loadCommunities();
  }, [session, communitySlug]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild darf max. 5 MB groß sein");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        } else {
          toast.error("Bild konnte nicht hochgeladen werden");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          communityId: communityId || undefined,
          imageUrl,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success("Post veröffentlicht!");
        router.push(`/posts/${post.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Fehler beim Erstellen");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="container-narrow py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mesh-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container-narrow py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post erstellen</h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Community selector */}
          <div>
            <label className="label" htmlFor="community">
              Community (optional)
            </label>
            <select
              id="community"
              className="input"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
            >
              <option value="">Kein Community (allgemeiner Post)</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  c/{c.name}
                </option>
              ))}
            </select>
            {communities.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Tritt Communities bei um dort zu posten.{" "}
                <a href="/communities" className="link">
                  Communities entdecken →
                </a>
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="label" htmlFor="content">
              Dein Post
            </label>
            <textarea
              id="content"
              className="textarea w-full"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Was möchtest du teilen?"
              required
              maxLength={5000}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${content.length > 4500 ? "text-red-500" : "text-gray-400"}`}>
                {content.length}/5000
              </span>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="label">Bild hinzufügen (optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-mesh-400 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Klicken zum Hochladen (max. 5 MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary flex-1"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn btn-primary flex-1"
            >
              {loading ? "Veröffentlichen..." : "Veröffentlichen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="container-narrow py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mesh-600" /></div>}>
      <CreatePostForm />
    </Suspense>
  );
}
