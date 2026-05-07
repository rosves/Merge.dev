import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// langues supportees
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // verifier que la locale est valide
  if (!locale || !locales.includes(locale as Locale)) {
    locale = "fr"; // par defaut
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
