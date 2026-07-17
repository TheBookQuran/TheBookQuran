"use client";

import { useThemeStore } from "@/stores/theme";

export function useResolvedTheme() {
  return useThemeStore((state) => state.resolvedTheme);
}
