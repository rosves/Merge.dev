"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import "@/styles/landing.css";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Afficher loading pendant vérification
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  // Afficher landing uniquement si non connecté
  if (user) return null;

  return (
    <>
      {/* Nav */}
      <nav className="nav fixed top-0 z-50 w-full">
        <div className="shell nav-inner">
          <Link href="/" className="brand" aria-label="merge accueil">
            <svg className="logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9 8 V16 Q9 22 16 24" stroke="#3b82f6" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M23 8 V16 Q23 22 16 24" stroke="#3b82f6" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <line x1="9" y1="8" x2="23" y2="8" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              <circle cx="9" cy="8" r="3" fill="#3b82f6"/>
              <circle cx="23" cy="8" r="3" fill="#3b82f6"/>
              <circle cx="16" cy="24" r="3.4" fill="#ffffff"/>
              <circle cx="9" cy="8" r="1" fill="#0a0a0a"/>
              <circle cx="23" cy="8" r="1" fill="#0a0a0a"/>
            </svg>
            <span>merge</span>
          </Link>
          <div className="nav-actions">
            <Link href="/login" className="btn">se connecter</Link>
            <Link href="/login" className="btn btn-primary">s'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="shell">
          <div className="eyebrow">mentorat dev · temps réel</div>
          <h1 className="title">Junior rencontre <span className="accent">senior.</span><br/>Les deux progressent.</h1>
          <p className="hero-sub">Une plateforme où les développeurs juniors trouvent un mentor, posent leurs questions et apprennent en direct — pendant que les seniors transmettent et restent à jour.</p>
          <div className="hero-ctas">
            <Link href="/login" className="btn btn-primary btn-lg">créer un compte <span className="arrow">→</span></Link>
            <Link href="/login" className="btn btn-lg">se connecter</Link>
          </div>

          {/* Terminal */}
          <div className="terminal" role="img" aria-label="aperçu terminal">
            <div className="term-bar">
              <div className="term-dots"><span></span><span></span><span></span></div>
              <div className="term-title">merge — feed</div>
            </div>
            <div className="term-body">
              <div className="tline"><span className="prompt">$</span><span><span className="kw">merge</span> <span className="txt">connect</span></span></div>
              <div className="tline"><span className="check">✓</span><span className="txt">connecté en tant que junior</span></div>
              <div className="tline"><span className="prompt">$</span><span><span className="kw">merge</span> <span className="txt">feed --live</span></span></div>
              <div className="tline"><span className="arrow">→</span><span className="txt">Sophie A. <span className="dim">· React Server Components...</span></span></div>
              <div className="tline"><span className="arrow">→</span><span className="txt">Thomas M. <span className="dim">· Docker en prod, les pièges...</span></span></div>
              <div className="tline"><span className="prompt">_<span className="cursor"></span></span></div>
            </div>
          </div>
        </div>
      </header>

      {/* Feed Preview */}
      <section className="block" style={{paddingTop: "24px"}}>
        <div className="shell">
          <div className="feed-head">
            <span className="feed-eyebrow">feed · dernières ressources</span>
            <span className="live-tag"><span className="live-dot"></span>live</span>
          </div>

          <div className="feed-list">
            <article className="post">
              <div className="avatar blue">SA</div>
              <div>
                <h4 className="post-title"><span className="name">Sophie A.</span><span className="dash">—</span>React Server Components et le futur du data fetching</h4>
                <div className="post-meta"><span className="role">mentor</span><span className="sep">·</span>#react<span className="sep">·</span>il y a 2 min</div>
              </div>
            </article>

            <article className="post">
              <div className="avatar green">TM</div>
              <div>
                <h4 className="post-title"><span className="name">Thomas M.</span><span className="dash">—</span>Pourquoi j'ai migré de TypeORM vers Prisma</h4>
                <div className="post-meta"><span className="role">mentor</span><span className="sep">·</span>#backend<span className="sep">·</span>il y a 9 min</div>
              </div>
            </article>

            <article className="post">
              <div className="avatar violet">LK</div>
              <div>
                <h4 className="post-title"><span className="name">Léa K.</span><span className="dash">—</span>Les erreurs classiques en déploiement Docker</h4>
                <div className="post-meta"><span className="role">admin</span><span className="sep">·</span>#devops<span className="sep">·</span>il y a 18 min</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta">
        <div className="shell cta-inner">
          <h2>Prêt à <span className="accent">merger</span> avec la communauté&nbsp;?</h2>
          <Link href="/login" className="btn btn-primary btn-lg">créer un compte <span className="arrow">→</span></Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="shell foot-inner">
          <span>© 2026 merge · esgi</span>
          <span className="lang">
            <a href="#" className="active">fr</a>
            <span className="sep">/</span>
            <a href="#">en</a>
          </span>
        </div>
      </footer>
    </>
  );
}
