"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { useSSE } from "@/hooks/useSSE";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";

interface News {
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

export default function DashboardPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tNews = useTranslations("news");
  const tCommon = useTranslations("common");

  const [newsList, setNewsList] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Charger les actualités
  useEffect(() => {
    if (!user || !token) return;

    fetch(`${API_URL}/news`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setNewsList(data);
        setLoadingNews(false);
      })
      .catch((err) => {
        console.error("[Dashboard] Erreur chargement:", err);
        setLoadingNews(false);
      });
  }, [user, token, API_URL]);

  // SSE pour les nouvelles actualités
  useSSE({
    endpoint: "/sse/news",
    autoConnect: !!user,
    onMessage: (event) => {
      try {
        const newsItem = JSON.parse(event.data);
        setNewsList((prev) => [newsItem, ...prev]);
      } catch (err) {
        console.error("[Dashboard] Erreur SSE:", err);
      }
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400 font-mono text-sm">{tCommon("loading")}</p>
      </div>
    );
  }

  const canCreate = user.role === "MODERATOR" || user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
              {t("eyebrow")}
            </p>
            <h1 className="text-3xl font-bold text-white font-mono">{t("title")}</h1>
          </div>

          {canCreate && (
            <Link href="/news/create">
              <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition font-mono text-sm font-medium">
                {t("publishButton")}
              </button>
            </Link>
          )}
        </div>

        {/* Liste des posts */}
        {loadingNews ? (
          <div className="text-center text-gray-500 py-12 font-mono text-sm">
            {tCommon("loading")}
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="font-mono text-sm">{t("noNews")}</p>
            {canCreate && (
              <p className="text-xs text-gray-600 mt-2">{t("noNewsSubtitle")}</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {newsList.map((news) => {
              const isMentor = news.author.role === "MODERATOR" || news.author.role === "ADMIN";
              const isAuthor = user.id === news.authorId;

              return (
                <article
                  key={news.id}
                  className="relative p-6 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] transition group"
                >
                  {/* Clickable overlay for entire card */}
                  <Link href={`/post/${news.id}`} className="absolute inset-0 z-0" />

                  {/* Header */}
                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <Link href={`/profile/${news.author.id}`} className="relative z-20">
                        <div
                          className={`w-11 h-11 rounded-lg flex items-center justify-center text-sm font-mono font-semibold border cursor-pointer transition ${
                            isMentor
                              ? "bg-purple-900/20 border-purple-500/30 text-purple-300 hover:border-purple-500/50"
                              : "bg-blue-900/20 border-blue-500/30 text-blue-300 hover:border-blue-500/50"
                          }`}
                        >
                          {news.author.username.substring(0, 2).toUpperCase()}
                        </div>
                      </Link>

                      {/* Author info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${news.author.id}`} className="relative z-20">
                            <span className="font-mono text-sm text-white hover:text-blue-400 transition cursor-pointer">
                              {news.author.username}
                            </span>
                          </Link>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                              isMentor
                                ? "bg-purple-900/30 text-purple-400 border border-purple-500/30"
                                : "bg-blue-900/30 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {isMentor ? tNews("mentor") : tNews("junior")}
                          </span>
                        </div>
                        <time className="text-xs font-mono text-gray-600">
                          {new Date(news.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                    </div>

                    {/* Edit button */}
                    {isAuthor && (
                      <Link href={`/news/edit/${news.id}`} className="relative z-20">
                        <button className="opacity-0 group-hover:opacity-100 transition px-3 py-1 text-xs font-mono text-gray-400 hover:text-white border border-[#2a2a2a] rounded hover:border-gray-500">
                          {tNews("editButton")}
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Content */}
                  <h2 className="text-lg font-semibold text-white mb-3 leading-snug group-hover:text-blue-400 transition">
                    {news.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {news.content}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
