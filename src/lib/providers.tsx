"use client";

import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "./query-client";
import { useThemeStore } from "@/stores/theme";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useSettingsStore } from "@/stores/settings";
import { DEFAULT_TRANSLATION_ID } from "@/services/api-paths";
import { ReadingPreference } from "@/types/settings";

interface ProvidersProps {
  children: React.ReactNode;
  initialReadingPreference?: ReadingPreference;
}

export function Providers({ children, initialReadingPreference }: ProvidersProps) {
  // Use state to instantiate a new QueryClient per client session
  const [queryClient] = useState(() => createQueryClient());
  const theme = useThemeStore((state) => state.theme);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);
  const setQuranTextFontScale = useQuranReaderStore((state) => state.setQuranTextFontScale);
  const setReadingPreference = useQuranReaderStore((state) => state.setReadingPreference);

  const [initialized, setInitialized] = useState(false);
  if (typeof window !== "undefined" && !initialized) {
    try {
      const saved = localStorage.getItem("quran-reader-store");
      if (!saved && initialReadingPreference) {
        useQuranReaderStore.setState({ readingPreference: initialReadingPreference });
      }
    } catch (e) {
      console.error(e);
    }
    setInitialized(true);
  }

  const selectedTranslations = useSettingsStore((state) => state.selectedTranslations);
  const setSelectedTranslations = useSettingsStore((state) => state.setSelectedTranslations);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let active: "light" | "dark" | "sepia" = "light";
      if (theme === "system") {
        active = mediaQuery.matches ? "dark" : "light";
      } else {
        active = theme as "light" | "dark" | "sepia";
      }
      document.documentElement.setAttribute("data-theme", active);
      setResolvedTheme(active);
    };

    applyTheme();

    const handleChange = () => {
      if (theme === "system") {
        const active = mediaQuery.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", active);
        setResolvedTheme(active);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, setResolvedTheme]);

  // Set default font scale based on screen size on first load
  useEffect(() => {
    const savedStateStr = localStorage.getItem("quran-reader-store");
    let needsDefaultScale = false;

    if (!savedStateStr) {
      needsDefaultScale = true;
    } else {
      try {
        const parsed = JSON.parse(savedStateStr);
        if (parsed?.state?.quranTextFontScale === undefined) {
          needsDefaultScale = true;
        }
      } catch (e) {
        needsDefaultScale = true;
      }
    }

    if (needsDefaultScale) {
      const width = window.innerWidth;
      let defaultScale = 3; // medium screens default
      if (width >= 1200) {
        defaultScale = 4; // large screens
      } else if (width < 768) {
        defaultScale = 2; // mobile screens
      }
      setQuranTextFontScale(defaultScale);
    }
  }, [setQuranTextFontScale]);

  // Migrate old QDC translation ID 131 to official API translation ID 85 (Abdul Haleem) and remove duplicates
  useEffect(() => {
    if (selectedTranslations.includes(131)) {
      const updated = Array.from(
        new Set(selectedTranslations.map((id) => (id === 131 ? DEFAULT_TRANSLATION_ID : id)))
      );
      setSelectedTranslations(updated);
    }
  }, [selectedTranslations, setSelectedTranslations]);

  // Apply initial reading preference from server cookie on first load if no localStorage exists
  useEffect(() => {
    if (initialReadingPreference) {
      const saved = localStorage.getItem("quran-reader-store");
      if (!saved) {
        setReadingPreference(initialReadingPreference);
      }
    }
  }, [initialReadingPreference, setReadingPreference]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
