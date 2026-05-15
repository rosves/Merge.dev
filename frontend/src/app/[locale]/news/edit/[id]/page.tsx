"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";

interface News {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

export default function EditNewsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const t = useTranslations("news");
  const tCommon = useTranslations("common");

  const [news, setNews] = useState<News | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user || !token) return;

    // Charger le post
    fetch(`${API_URL}/news/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Post introuvable");
        return res.json();
      })
      .then((data) => {
        // Vérifier que l'utilisateur est l'auteur
        if (data.authorId !== user.id) {
          router.push("/dashboard");
          return;
        }
        setNews(data);
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[EditNews] Erreur:", err);
        router.push("/dashboard");
      });
  }, [user, token, postId, API_URL, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !token) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/news/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la sauvegarde");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("[EditNews] Erreur:", err);
      alert("Erreur serveur");
      setSubmitting(false);
    }
  };

  if (isLoading || loading || !user || !news) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400 font-mono text-sm">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-gray-300 transition mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          {t("backToFeed")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-gray-600 mb-2">{t("eyebrowEdit")}</p>
          <h1 className="text-3xl font-bold text-white font-mono">{t("edit")}</h1>
        </div>

        {/* Form */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-mono text-gray-400 mb-2">
                {t("title")}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-500 transition font-sans"
                placeholder={t("titlePlaceholder")}
                required
                autoFocus
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-mono text-gray-400 mb-2">
                {t("content")}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-500 transition resize-none font-sans"
                placeholder={t("contentPlaceholder")}
                rows={12}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed transition font-mono text-sm font-medium"
              >
                {submitting ? t("saving") : t("save")}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-transparent border border-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#0f0f0f] transition font-mono text-sm inline-flex items-center"
              >
                {t("cancel")}
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
