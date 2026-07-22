import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { Providers } from "@/lib/providers";
import { getReadingPreference } from "@/lib/reading-preference";
import Navbar from "@/components/navbar/Navbar";
import AudioPlayer from "@/components/audio-player/AudioPlayer";
import SearchOverlay from "@/components/search/SearchOverlay";
import SettingsDrawer from "@/components/navbar/SettingsDrawer";
import Footer from "@/components/footer/Footer";
import { SITE_URL } from "@/lib/config";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  const title = isAr
    ? "القرآن الكريم | Quran - قراءة واستماع وتدبر"
    : "Quran Online - Read, Listen & Study the Holy Quran | Quran";

  const description = isAr
    ? "موقع قرآن (Quran) لقراءة واستماع القرآن الكريم وتدبر معاني الكلمات بالاعتماد على الجذور اللغوية. استمع لأشهر القراء وتصفح الآيات مجاناً بدون إعلانات."
    : "Read and listen to the Holy Quran online on Quran. Explore Quranic word-by-word translations, audio recitations by famous reciters, and linguistic root analyses. Free of ads.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: isAr ? "%s | القرآن الكريم - Quran" : "%s | Quran",
    },
    description,
    keywords: isAr
      ? [
          "القرآن",
          "قرآن كريم",
          "القرآن الكريم",
          "استماع للقرآن",
          "تفسير القرآن",
          "معاني كلمات القرآن",
          "مصحف إلكتروني",
          "تلاوة القرآن",
          "quran",
        ]
      : [
          "Quran",
          "Al-Quran",
          "Holy Quran",
          "Noble Quran",
          "read Quran online",
          "listen Quran",
          "Quran translation",
          "Quran word by word",
          "Quran root word analysis",
        ],
    alternates: {
      canonical: `./`,
      languages: {
        ar: `${baseUrl}/ar`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: "Quran",
      locale: isAr ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/Favicon.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get translation messages for next-intl
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const readingPref = await getReadingPreference(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const store = JSON.parse(localStorage.getItem('quran-theme-store'));
                  const theme = store && store.state && store.state.theme ? store.state.theme : 'system';
                  let targetTheme = theme;
                  if (theme === 'system') {
                    targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', targetTheme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `
          }}
        />
      </head>
      <body>
        <Providers initialReadingPreference={readingPref}>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            {children}
            <Footer />
            <AudioPlayer />
            <SearchOverlay />
            <SettingsDrawer />
            <Analytics />
          </NextIntlClientProvider>
        </Providers>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
