"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: {
    id: number;
    username: string;
    role: string;
  };
  createdAt: string;
}

export default function PostPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const t = useTranslations("news");
  const tCommon = useTranslations("common");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Post] Erreur:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [user, token, postId, API_URL, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400 font-mono text-sm">{tCommon("loading")}</p>
      </div>
    );
  }

  if (error || !post || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500">
            <p className="font-mono">{t("postNotFound")}</p>
          </div>
        </main>
      </div>
    );
  }

  const isMentor = post.author.role === "MODERATOR" || post.author.role === "ADMIN";
  const initials = post.author.username.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-gray-300 transition mb-10 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            {t("backToFeed")}
          </Link>

          {/* Category tag */}
          <span className="text-xs font-mono text-blue-400 mb-4 inline-block">#ressource</span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Author row */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#1f1f1f]">
            {/* Avatar */}
            <Link href={`/profile/${post.author.id}`}>
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-base font-mono font-semibold border-2 cursor-pointer transition ${
                  isMentor
                    ? "bg-purple-900/20 border-purple-500/30 text-purple-300 hover:border-purple-500/50"
                    : "bg-blue-900/20 border-blue-500/30 text-blue-300 hover:border-blue-500/50"
                }`}
              >
                {initials}
              </div>
            </Link>

            {/* Author info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-mono text-gray-500">{t("publishedBy")}</span>
                <Link href={`/profile/${post.author.id}`}>
                  <span className="font-mono text-sm text-white hover:text-blue-400 transition cursor-pointer">
                    {post.author.username}
                  </span>
                </Link>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    isMentor
                      ? "bg-purple-900/30 text-purple-400 border border-purple-500/30"
                      : "bg-blue-900/30 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {isMentor ? t("mentor") : t("junior")}
                </span>
                <span className="text-xs font-mono text-gray-600">
                  {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Author card */}
          <aside className="mt-16 p-6 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg flex items-center gap-6">
            <Link href={`/profile/${post.author.id}`}>
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-lg font-mono font-semibold border-2 cursor-pointer transition ${
                  isMentor
                    ? "bg-purple-900/20 border-purple-500/30 text-purple-300 hover:border-purple-500/50"
                    : "bg-blue-900/20 border-blue-500/30 text-blue-300 hover:border-blue-500/50"
                }`}
              >
                {initials}
              </div>
            </Link>

            <div className="flex-1">
              <p className="text-xs font-mono text-gray-600 mb-1">{t("aboutAuthor")}</p>
              <Link href={`/profile/${post.author.id}`}>
                <h3 className="font-mono font-semibold text-white hover:text-blue-400 transition cursor-pointer">
                  {post.author.username}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {isMentor ? t("mentor") : t("junior")}
              </p>
            </div>

            <Link
              href={`/profile/${post.author.id}`}
              className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#161616] hover:text-white hover:border-[#3a3a3a] transition font-mono text-sm flex items-center gap-2 group"
            >
              {t("viewProfile")}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </aside>
        </article>
      </main>
    </div>
  );
}
