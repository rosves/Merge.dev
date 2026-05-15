"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import "@/styles/profile-edit.css";

export default function ProfileEditPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("profile.editPage");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");

  const [bio, setBio] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user || !token) return;

    // Charger le profil actuel
    fetch(`${API_URL}/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBio(data.bio || "");
        setProfessionalTitle(data.professionalTitle || "");
        setSkillsInput(data.skills ? data.skills.join(", ") : "");
        setGithub(data.github || "");
        setLinkedin(data.linkedin || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("[ProfileEdit] Erreur:", err);
        setLoading(false);
      });
  }, [user, token, API_URL, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !user) return;

    setSaving(true);

    // Parser skills (séparées par des virgules)
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: bio.trim() || null,
          professionalTitle: professionalTitle.trim() || null,
          skills: skills.length > 0 ? skills : null,
          github: github.trim() || null,
          linkedin: linkedin.trim() || null,
        }),
      });

      if (res.ok) {
        router.push(`/profile/${user.id}`);
      } else {
        const error = await res.json();
        alert(error.error || t("saveError"));
        setSaving(false);
      }
    } catch (err) {
      console.error("[ProfileEdit] Erreur:", err);
      alert(t("serverError"));
      setSaving(false);
    }
  };

  if (isLoading || loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">{tCommon("loading")}</div>;
  }

  const initials = user.username.slice(0, 2).toUpperCase();
  const displayName = user.username;
  const roleColor = user.role === "ADMIN" ? "amber" : user.role === "MODERATOR" ? "violet" : "blue";

  return (
    <>
      <Navbar />

      <main data-screen-label="profile-edit">
        <div className="shell">
          <div className="page-eyebrow">{t("eyebrow")}</div>
          <h1 className="page-title">{t("title")}</h1>

          <div className="grid">
            <aside className="side">
              <div className={`avatar ${roleColor} lg`}>{initials}</div>
              <h2>{displayName}</h2>
              <span className={`role-badge ${roleColor}`}>{tProfile(user.role === "MODERATOR" || user.role === "ADMIN" ? "mentor" : "junior")}</span>
              <span className="since">{t("editingLabel")}</span>
            </aside>

            <div className="content">
              <Link href={`/profile/${user.id}`} className="back-link">{t("backToProfile")}</Link>

              <form onSubmit={handleSubmit} className="profile-card">
                <section className="section">
                  <div className="section-head">
                    <div className="section-eyebrow">// section</div>
                    <h3 className="section-title">{t("sectionPublic")}</h3>
                  </div>

                  <div className="field">
                    <label htmlFor="title">{t("professionalTitle")}</label>
                    <input
                      id="title"
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      className="input"
                      placeholder={t("professionalTitlePlaceholder")}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="bio">{t("bio")}</label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="input"
                      rows={5}
                      placeholder={t("bioPlaceholder")}
                    />
                    <span className="hint">{t("bioHint")}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="skills">{t("skills")}</label>
                    <input
                      id="skills"
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="input"
                      placeholder={t("skillsPlaceholder")}
                    />
                    <p className="hint">{t("skillsHint")}</p>
                  </div>
                </section>

                <section className="section">
                  <div className="section-head">
                    <div className="section-eyebrow">// section</div>
                    <h3 className="section-title">{t("sectionSocials")}</h3>
                  </div>

                  <div className="socials">
                    <div className="social-row">
                      <span className="social-icon" aria-label="github">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>
                      </span>
                      <input
                        className="input"
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder={t("githubPlaceholder")}
                      />
                    </div>
                    <div className="social-row">
                      <span className="social-icon" aria-label="linkedin">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18.3H5.7V9.7h2.6v8.6zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11.3 9.8h-2.6v-4.6c0-1.1-.4-1.8-1.4-1.8-1.1 0-1.6.7-1.6 1.8v4.6h-2.6V9.7h2.5v1.1c.4-.7 1.3-1.3 2.5-1.3 1.8 0 3.2 1.2 3.2 3.7v5.1z"/></svg>
                      </span>
                      <input
                        className="input"
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder={t("linkedinPlaceholder")}
                      />
                    </div>
                  </div>
                </section>

                <section className="section">
                  <div className="section-head">
                    <div className="section-eyebrow">// section</div>
                    <h3 className="section-title">{t("sectionActions")}</h3>
                  </div>

                  <div className="actions">
                    <button type="submit" disabled={saving} className="btn btn-violet">
                      {saving ? t("saving") : t("save")} <span className="arrow">→</span>
                    </button>
                    <Link href={`/profile/${user.id}`} className="btn">{t("cancel")}</Link>
                  </div>
                </section>

                <section className="section danger">
                  <div className="section-eyebrow">{t("dangerZone")}</div>
                  <h3 className="section-title">{t("dangerTitle")}</h3>
                  <p>{t("dangerDescription")}</p>
                  <button type="button" className="btn btn-danger">{t("deleteAccount")}</button>
                </section>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}