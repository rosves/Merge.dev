"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";

interface ProfileUser {
  id: number;
  username: string;
  role: string;
  bio?: string;
  professionalTitle?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  createdAt: string;
  news: Array<{
    id: number;
    title: string;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const t = useTranslations("profile");
  const tNews = useTranslations("news");
  const tCommon = useTranslations("common");

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user || !token) return;

    // Charger le profil
    fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Profil introuvable");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Profile] Erreur:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [user, token, userId, API_URL, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400 font-mono text-sm">{tCommon("loading")}</p>
      </div>
    );
  }

  if (error || !profile || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500">
            <p>{t("notFound")}</p>
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = user.id === profile.id;
  const isMentor = profile.role === "MODERATOR" || profile.role === "ADMIN";
  const avatarColor = isMentor
    ? "bg-purple-900/20 border-purple-500/30 text-purple-300"
    : "bg-blue-900/20 border-blue-500/30 text-blue-300";
  const initials = profile.username.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-gray-300 mb-8 transition group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            {t("backToFeed")}
          </Link>

          {/* Hero */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-8 mb-6">
            <div className="flex flex-col items-center text-center gap-4">
              {/* Avatar */}
              <div
                className={`w-24 h-24 rounded-xl flex items-center justify-center text-3xl font-mono font-semibold border-2 ${avatarColor}`}
              >
                {initials}
              </div>

              {/* Name + role */}
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">{profile.username}</h1>
                <div className="inline-flex items-center gap-2 text-sm">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isMentor ? "bg-purple-500" : "bg-blue-500"
                    }`}
                  ></span>
                  <span
                    className={`font-mono ${
                      isMentor ? "text-purple-400" : "text-blue-400"
                    }`}
                  >
                    {isMentor ? t("mentor") : t("junior")}
                  </span>
                </div>
              </div>

              {/* Professional title */}
              {profile.professionalTitle && (
                <p className="text-sm text-gray-500 font-mono">
                  {t("professionalTitle", { title: profile.professionalTitle })}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-400 leading-relaxed max-w-lg">{profile.bio}</p>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-mono bg-[#0a0a0a] text-gray-400 rounded-full border border-[#2a2a2a]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Socials */}
              {(profile.github || profile.linkedin) && (
                <div className="flex gap-3 mt-2">
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-gray-500 hover:text-white hover:border-[#3a3a3a] hover:bg-[#161616] transition"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.45.11-3.03 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.74.11 3.03.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12 .5Z" />
                      </svg>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-gray-500 hover:text-white hover:border-[#3a3a3a] hover:bg-[#161616] transition"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.21 0 22.23 0z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Posts section - ALWAYS clickable */}
          {profile.news && profile.news.length > 0 && (
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
              <h2 className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-4">
                {t("eyebrowPosts")}
              </h2>
              <div className="space-y-4">
                {profile.news.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="flex justify-between items-start gap-4 pb-4 border-b border-[#1f1f1f] last:border-0 last:pb-0 group cursor-pointer"
                  >
                    <span className="text-sm font-medium text-gray-300 flex-1 group-hover:text-white transition">
                      {post.title}
                    </span>
                    <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 justify-center">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-mono text-sm hover:bg-gray-200 transition"
              >
                {t("editProfile")} →
              </Link>
            ) : (
              <Link
                href={`/messages?user=${profile.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-mono text-sm hover:bg-blue-700 transition"
              >
                {t("sendMessage")} →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
