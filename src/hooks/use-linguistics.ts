import { useQuery } from "@tanstack/react-query";
import { EnrichedLexiconEntry, LinguisticRoot } from "@/types/linguistics";
import { normalizeRoot } from "@/lib/linguistics/normalize";
import { camelizeKeys } from "@/lib/case-utils";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  return camelizeKeys(json) as T;
}

// Cache the entire word-to-root mappings file
export function useWordToRootMapping() {
  return useQuery({
    queryKey: ["word-to-root-mapping"],
    queryFn: () => fetcher<Record<string, string>>("/data/linguistics/word_to_root.json"),
    staleTime: Infinity,
  });
}

// Cache the entire roots details file with normalization applied
export function useRootsData() {
  return useQuery({
    queryKey: ["roots-data"],
    queryFn: async () => {
      const rawRoots = await fetcher<Record<string, any>>("/data/linguistics/roots.json");
      const normalized: Record<string, LinguisticRoot> = {};
      for (const [id, raw] of Object.entries(rawRoots)) {
        const norm = normalizeRoot(raw);
        if (norm) {
          normalized[id] = norm;
        }
      }
      return normalized;
    },
    staleTime: Infinity,
  });
}

// Get root details for a specific word location (e.g. "2:255:4")
export function useWordRoot(wordLocation: string | null) {
  const { data: mapping } = useWordToRootMapping();
  const { data: roots } = useRootsData();

  return useQuery({
    queryKey: ["word-root", wordLocation],
    queryFn: () => {
      if (!wordLocation || !mapping || !roots) return null;
      const rootId = mapping[wordLocation];
      if (!rootId) return null;
      return roots[rootId] || null;
    },
    enabled: !!wordLocation && !!mapping && !!roots,
    staleTime: Infinity,
  });
}

// Get root details directly by rootId
export function useRootData(rootId: string | null) {
  const { data: roots } = useRootsData();

  return useQuery({
    queryKey: ["root-data", rootId],
    queryFn: () => {
      if (!rootId || !roots) return null;
      return roots[rootId] || null;
    },
    enabled: !!rootId && !!roots,
    staleTime: Infinity,
  });
}

// Cache the entire occurrences file ONCE
export function useAllOccurrences() {
  return useQuery({
    queryKey: ["all-root-occurrences"],
    queryFn: () => fetcher<Record<string, any>>("/data/linguistics/occurrences.json"),
    staleTime: Infinity,
  });
}

// Get occurrences list for a given rootId
export function useRootOccurrences(rootId: string | null) {
  const { data: allOccurrences } = useAllOccurrences();

  return useQuery({
    queryKey: ["root-occurrences", rootId],
    queryFn: () => {
      if (!rootId || !allOccurrences) return [];
      return (allOccurrences[rootId] || []) as {
        chapterNumber: number;
        verseNumber: number;
        wordPosition: number;
      }[];
    },
    enabled: !!rootId && !!allOccurrences,
    staleTime: Infinity,
  });
}

// Get enriched AI lexicon details by rootId
export function useEnrichedLexicon(rootId: string | null) {
  return useQuery({
    queryKey: ["enriched-lexicon", rootId],
    queryFn: async () => {
      if (!rootId) return null;
      try {
        return await fetcher<EnrichedLexiconEntry>(`/data/linguistics/enriched/${rootId}.json`);
      } catch (err) {
        // Enriched definition might not exist yet or failed to load (e.g. 404)
        return null;
      }
    },
    enabled: !!rootId,
    staleTime: Infinity,
    retry: false,
  });
}

