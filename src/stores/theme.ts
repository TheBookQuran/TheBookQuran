import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeType, ResolvedTheme } from "@/types/theme";

interface ThemeState {
  theme: ThemeType;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeType) => void;
  setResolvedTheme: (resolvedTheme: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",
      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    }),
    {
      name: "quran-theme-store",
      partialize: (state) => ({
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme to documentElement when loaded from localStorage
        if (state && typeof document !== "undefined") {
          let active: ResolvedTheme = "light";
          if (state.theme === "system") {
            active = window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
          } else {
            active = state.theme as ResolvedTheme;
          }
          state.resolvedTheme = active;
          document.documentElement.setAttribute("data-theme", active);
        }
      },
    }
  )
);

