import createMiddleware from "next-intl/middleware";
import { locales } from "./src/i18n/request";

export default createMiddleware({
  locales,
  defaultLocale: "fr",
  localePrefix: "always", // toujours afficher /fr ou /en dans l'url
});

export const config = {
  // matcher : sur quelles routes appliquer le middleware
  // ici on exclut les fichiers statiques, api, etc
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
