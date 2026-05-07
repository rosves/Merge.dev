import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function HomePage() {
  const t = useTranslations("nav");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Merge</h1>
          <ul className="flex gap-4">
            <li>{t("home")}</li>
            <li>{t("dashboard")}</li>
            <li>{t("messages")}</li>
          </ul>
        </div>
      </nav>

      <main className="flex-1 container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-4">Bienvenue sur Merge</h2>
        <p className="text-gray-600">
          Plateforme de mentorat tech en temps réel.
        </p>
      </main>

      <footer className="bg-gray-100 p-4">
        <div className="container mx-auto flex justify-end">
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
