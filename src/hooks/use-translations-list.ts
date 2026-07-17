import { useQuery } from "@tanstack/react-query";
import { getAvailableTranslations } from "@/services/quran-api";

export function useTranslationsList(locale: string) {
  return useQuery({
    queryKey: ["translations-list", locale],
    queryFn: () => getAvailableTranslations(locale),
    staleTime: Infinity,
  });
}
