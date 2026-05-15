"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import "@/styles/auth.css";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  username: z.string().min(3, "Minimum 3 caractères"),
  password: z.string().min(6, "Minimum 6 caractères"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"junior" | "mentor">("junior");
  const [error, setError] = useState("");
  const { login, register: registerUser } = useAuth();
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");

  const {
    register: registerLoginField,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegisterField,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      setError("");
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || tErrors("loginFailed"));
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      setError("");
      await registerUser(data.email, data.username, data.password);
    } catch (err: any) {
      setError(err.message || tErrors("serverError"));
    }
  };

  return (
    <>
      <nav className="nav">
        <div className="shell nav-inner">
          <Link href="/" className="brand" aria-label="merge — accueil">
            <svg className="logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9 8 V16 Q9 22 16 24" stroke="#3b82f6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <path d="M23 8 V16 Q23 22 16 24" stroke="#3b82f6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <line x1="9" y1="8" x2="23" y2="8" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              <circle cx="9" cy="8" r="3" fill="#3b82f6" />
              <circle cx="23" cy="8" r="3" fill="#3b82f6" />
              <circle cx="16" cy="24" r="3.4" fill="#ffffff" />
              <circle cx="9" cy="8" r="1" fill="#0a0a0a" />
              <circle cx="23" cy="8" r="1" fill="#0a0a0a" />
            </svg>
            <span>merge</span>
          </Link>
          <div className="nav-actions">
            <button type="button" className="btn" onClick={() => { setIsLogin(true); setError(""); }}>
              {t("login")}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => { setIsLogin(false); setError(""); }}>
              {t("register")}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <div className="shell">
          <div className="auth-grid">
            <div className="terminal-col">
              <div className="terminal" role="img" aria-label="aperçu terminal merge auth">
                <div className="term-bar">
                  <div className="term-dots"><span></span><span></span><span></span></div>
                  <div className="term-title">merge — auth</div>
                </div>
                <div className="term-body">
                  <div className="tline"><span className="prompt">$</span><span><span className="kw">merge</span> <span className="txt">auth --init</span></span></div>
                  <div className="tline"><span className="check">✓</span><span className="dim">connexion sécurisée établie</span></div>
                  <div className="tline"><span className="check">✓</span><span className="dim">chiffrement tls 1.3 actif</span></div>
                  <div className="tline"><span className="prompt">$</span><span><span className="kw">merge</span> <span className="txt">whoami</span></span></div>
                  <div className="tline"><span className="arrow">→</span><span className="dim">aucune session active</span></div>
                  <div className="tline"><span className="prompt">$</span><span><span className="kw">merge</span> <span className="txt">login --or signup</span></span></div>
                  <div className="tline"><span className="arrow">→</span><span className="violet">en attente de credentials...</span></div>
                  <div className="tline" style={{marginTop: 14}}><span className="prompt">$</span><span className="cursor"></span></div>
                </div>
              </div>
            </div>

            <div className="form-col">
              <div className="card">
                <div className="switch" role="tablist" aria-label="auth tabs">
                  <button
                    type="button"
                    id="tab-login"
                    className={isLogin ? "is-active" : ""}
                    role="tab"
                    aria-selected={isLogin}
                    aria-controls="pane-login"
                    onClick={() => { setIsLogin(true); setError(""); }}
                  >
                    {t("login")}
                  </button>
                  <button
                    type="button"
                    id="tab-signup"
                    className={!isLogin ? "is-active" : ""}
                    role="tab"
                    aria-selected={!isLogin}
                    aria-controls="pane-signup"
                    onClick={() => { setIsLogin(false); setError(""); }}
                  >
                    {t("register")}
                  </button>
                </div>

                {error && <div className="error-box">{error}</div>}

                {isLogin ? (
                  <form className="pane is-active" id="pane-login" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                    <div className="form-eyebrow">// session</div>
                    <h1 className="form-title">se connecter</h1>
                    <p className="form-sub">retrouve tes mentors et ton feed.</p>

                    <div className="field">
                      <label htmlFor="login-email">{t("email")}</label>
                      <input
                        id="login-email"
                        type="email"
                        {...registerLoginField("email")}
                        placeholder="dev@merge.io"
                      />
                      {loginErrors.email && <p className="field-error">{loginErrors.email.message}</p>}
                    </div>

                    <div className="field">
                      <label htmlFor="login-pwd">{t("password")}</label>
                      <input
                        id="login-pwd"
                        type="password"
                        {...registerLoginField("password")}
                        placeholder="••••••••"
                      />
                      {loginErrors.password && <p className="field-error">{loginErrors.password.message}</p>}
                    </div>

                    <div className="form-action">
                      <button type="submit" disabled={isLoginSubmitting} className="btn btn-blue btn-lg btn-block">
                        {isLoginSubmitting ? "..." : t("loginButton")} <span className="arrow">→</span>
                      </button>
                    </div>

                    <div className="form-foot">
                      pas encore de compte ? <button type="button" className="inline-link" onClick={() => { setIsLogin(false); setError(""); }}>{t("register")}</button>
                    </div>
                  </form>
                ) : (
                  <form className="pane is-active" id="pane-signup" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                    <div className="form-eyebrow">// nouveau compte</div>
                    <h1 className="form-title">créer un compte</h1>
                    <p className="form-sub">rejoins la communauté merge en 30 secondes.</p>

                    <div className="field">
                      <label htmlFor="su-first">{t("username")}</label>
                      <input
                        id="su-first"
                        type="text"
                        {...registerRegisterField("username")}
                        placeholder="ada"
                      />
                      {registerErrors.username && <p className="field-error">{registerErrors.username.message}</p>}
                    </div>

                    <div className="field">
                      <label htmlFor="su-email">{t("email")}</label>
                      <input
                        id="su-email"
                        type="email"
                        {...registerRegisterField("email")}
                        placeholder="dev@merge.io"
                      />
                      {registerErrors.email && <p className="field-error">{registerErrors.email.message}</p>}
                    </div>

                    <div className="field">
                      <label htmlFor="su-pwd">{t("password")}</label>
                      <input
                        id="su-pwd"
                        type="password"
                        {...registerRegisterField("password")}
                        placeholder="••••••••"
                      />
                      {registerErrors.password && <p className="field-error">{registerErrors.password.message}</p>}
                    </div>

                    <div className="field">
                      <label>rôle</label>
                      <div className="role-toggle" role="radiogroup" aria-label="choisir un rôle">
                        <button
                          type="button"
                          className={`role-btn ${role === "junior" ? "is-active" : ""}`}
                          onClick={() => setRole("junior")}
                          role="radio"
                          aria-checked={role === "junior"}
                        >
                          <span className="role-name">junior</span>
                          <span className="role-desc">j'apprends</span>
                        </button>
                        <button
                          type="button"
                          className={`role-btn ${role === "mentor" ? "is-active" : ""}`}
                          onClick={() => setRole("mentor")}
                          role="radio"
                          aria-checked={role === "mentor"}
                        >
                          <span className="role-name">mentor</span>
                          <span className="role-desc">je transmets</span>
                        </button>
                      </div>
                    </div>

                    <div className="form-action">
                      <button type="submit" disabled={isRegisterSubmitting} className="btn btn-blue btn-lg btn-block">
                        {isRegisterSubmitting ? "..." : t("registerButton")} <span className="arrow">→</span>
                      </button>
                    </div>

                    <div className="form-foot">
                      déjà un compte ? <button type="button" className="inline-link" onClick={() => { setIsLogin(true); setError(""); }}>{t("login")}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="shell foot-inner">
          <span>© 2026 merge · esgi</span>
          <span className="lang">
            <a className="active">fr</a>
            <span className="sep">/</span>
            <a>en</a>
          </span>
        </div>
      </footer>
    </>
  );
}
