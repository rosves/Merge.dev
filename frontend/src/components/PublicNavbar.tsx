"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function PublicNavbar() {
  const tAuth = useTranslations("auth");

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold hover:text-gray-300">
            Merge.dev
          </Link>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            
            <Link 
              href="/login" 
              className="hover:text-gray-300 transition-colors"
            >
              {tAuth("login")}
            </Link>
            
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              {tAuth("register")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}