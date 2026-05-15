"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    window.location.href = `/${newLocale}${pathname}`;
  };

  return (
    <div className="flex items-center gap-2 font-mono text-[12px]">
      <button
        onClick={() => switchLocale("fr")}
        className={`transition lowercase ${
          locale === "fr" ? "text-white" : "text-[#555] hover:text-[#8a8a8a]"
        }`}
      >
        fr
      </button>
      <span className="text-[#2a2a2a]">/</span>
      <button
        onClick={() => switchLocale("en")}
        className={`transition lowercase ${
          locale === "en" ? "text-white" : "text-[#555] hover:text-[#8a8a8a]"
        }`}
      >
        en
      </button>
    </div>
  );
}
