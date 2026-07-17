import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Locale prefix strategy
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match the root path
    "/",
    // Match paths with locales
    "/(ar|en)/:path*",
    // Exclude static assets
    "/((?!api|_next/static|_next/image|fonts|icons|images|data|favicon.ico|manifest.json|sitemap.xml).*)",
  ],
};
