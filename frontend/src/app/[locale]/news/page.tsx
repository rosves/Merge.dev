"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { useSSE } from "@/hooks/useSSE";
import Navbar from "@/components/Navbar";

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

export default function NewsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("news");
  const tDashboard = useTranslations("dashboard");

  const [newsList, setNewsList] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Charger les actualités au montage
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
        console.error("[News] Erreur chargement:", err);
        setLoadingNews(false);
      });
  }, [user, token, API_URL]);

  // Écouter les nouvelles actualités en temps réel (SSE)
  useSSE({
    endpoint: "/sse/news",
    autoConnect: !!user,
    onMessage: (event) => {
      try {
        const newsItem = JSON.parse(event.data);
        setNewsList((prev) => [newsItem, ...prev]);
      } catch (err) {
        console.error("[News] Erreur parsing SSE:", err);
      }
    },
  });

  // Créer une actualité
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
        setTitle("");
        setContent("");
        setShowForm(false);
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("[News] Erreur création:", err);
      alert("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const canCreate = user.role === "MODERATOR" || user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{tDashboard("title")}</h1>

            {canCreate && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                {showForm ? "Annuler" : t("create")}
              </button>
            )}
          </div>

          {/* Formulaire de création */}
          {showForm && canCreate && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Titre de l'actualité"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Contenu de l'actualité"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Publication..." : "Publier"}
              </button>
            </form>
          )}

          {/* Liste des actualités */}
          {loadingNews ? (
            <div className="text-center text-gray-500 py-12">Chargement des actualités...</div>
          ) : newsList.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>{tDashboard("noNews")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsList.map((news) => (
                <article
                  key={news.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{news.title}</h2>
                    <time className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {new Date(news.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{news.content}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium">{news.author.username}</span>
                    <span>•</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {news.author.role}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
