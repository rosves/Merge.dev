"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";

export default function CreateNewsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("news");
  const tCommon = useTranslations("common");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    // Vérifier que l'utilisateur peut publier
    if (user && user.role !== "MODERATOR" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !token) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/news`, {
        method: "POST",
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
        alert(error.error || "Erreur lors de la publication");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("[CreateNews] Erreur:", err);
      alert("Erreur serveur");
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
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
          <p className="text-xs font-mono text-gray-600 mb-2">{t("eyebrowCreate")}</p>
          <h1 className="text-3xl font-bold text-white font-mono">{t("create")}</h1>
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
                {submitting ? t("saving") : t("publish")}
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
