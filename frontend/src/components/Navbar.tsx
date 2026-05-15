"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const t = useTranslations("nav");
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const linkClass = "font-mono text-[13px] text-[#8a8a8a] hover:text-white lowercase transition";
  const mobileLinkClass = "font-mono text-[13px] text-[#8a8a8a] hover:text-white lowercase transition px-3 py-2.5 rounded-md hover:bg-[#131313] block";

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md border-b border-[#1f1f1f]">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 flex items-center justify-between h-[72px]">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 font-mono font-semibold text-base text-white hover:text-blue-400 transition"
        >
          <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M9 8 V16 Q9 22 16 24" stroke="#3b82f6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M23 8 V16 Q23 22 16 24" stroke="#3b82f6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <line x1="9" y1="8" x2="23" y2="8" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <circle cx="9" cy="8" r="3" fill="#3b82f6" />
            <circle cx="23" cy="8" r="3" fill="#3b82f6" />
            <circle cx="16" cy="24" r="3.4" fill="#fff" />
            <circle cx="9" cy="8" r="1" fill="#0a0a0a" />
            <circle cx="23" cy="8" r="1" fill="#0a0a0a" />
          </svg>
          <span>merge</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className={linkClass}>{t("dashboard")}</Link>
          <Link href="/messages" className={linkClass}>{t("messages")}</Link>
          {(user.role === "MODERATOR" || user.role === "ADMIN") && (
            <Link href="/groupe" className={linkClass}>{t("group")}</Link>
          )}
          <Link href={`/profile/${user.id}`} className={linkClass}>{t("profile")}</Link>

          <span className="w-px h-4 bg-[#2a2a2a] mx-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-[38px] h-[38px] rounded-lg border border-[#2a2a2a] bg-transparent flex items-center justify-center text-[#8a8a8a] hover:bg-[#161616] hover:text-white hover:border-[#3a3a3a] transition"
              aria-label="notifications"
            >
              <BellIcon />
            </button>
            {unreadCount > 0 && <NotifBadge count={unreadCount} />}
            {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          <LanguageSwitcher />

          <button
            onClick={logout}
            className="font-mono text-[13px] lowercase px-3.5 py-1.5 rounded-md border border-red-500/30 bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15] hover:border-red-500/50 transition"
          >
            {t("logout")}
          </button>
        </div>

        {/* Mobile: bell + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }}
              className="relative w-[38px] h-[38px] rounded-lg border border-[#2a2a2a] bg-transparent flex items-center justify-center text-[#8a8a8a] hover:bg-[#161616] hover:text-white hover:border-[#3a3a3a] transition"
              aria-label="notifications"
            >
              <BellIcon />
            </button>
            {unreadCount > 0 && <NotifBadge count={unreadCount} />}
            {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          <button
            type="button"
            onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }}
            className="w-[38px] h-[38px] rounded-lg border border-[#2a2a2a] bg-transparent flex items-center justify-center text-[#8a8a8a] hover:bg-[#161616] hover:text-white hover:border-[#3a3a3a] transition"
            aria-label="menu"
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="max-w-[1320px] mx-auto px-4 py-3 flex flex-col gap-0.5">
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>{t("dashboard")}</Link>
            <Link href="/messages" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>{t("messages")}</Link>
            {(user.role === "MODERATOR" || user.role === "ADMIN") && (
              <Link href="/groupe" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>{t("group")}</Link>
            )}
            <Link href={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>{t("profile")}</Link>

            <div className="mt-2 pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
              <LanguageSwitcher />
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="font-mono text-[13px] lowercase px-3.5 py-1.5 rounded-md border border-red-500/30 bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15] hover:border-red-500/50 transition"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function NotifBadge({ count }: { count: number }) {
  return (
    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center border-2 border-[#0a0a0a] pointer-events-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
