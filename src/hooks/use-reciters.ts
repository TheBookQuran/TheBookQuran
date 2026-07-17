import { useQuery } from "@tanstack/react-query";
import { getAvailableReciters } from "@/services/quran-api";

export function useReciters(locale: string) {
  return useQuery({
    queryKey: ["reciters-list", locale],
    queryFn: () => getAvailableReciters(locale),
    staleTime: Infinity,
  });
}
