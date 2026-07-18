import type { NewSearchResponse, SearchRequestParams } from "../../types";
import type { KalimatSearchResponse, KalimatSearchResult } from "./types";

export function mapKalimatToNewSearchResponse(
  kalimatResponse: KalimatSearchResponse,
  params: SearchRequestParams,
): NewSearchResponse {
  const page = params.page || 1;
  const size = params.size || 20;
  const totalRecords = kalimatResponse.data?.totalResultsNum ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / size));

  const verses = (kalimatResponse.data?.results ?? [])
    .filter((r) => r.type === "quran_verse")
    .map((r) => ({
      verseKey: r.id,
      words: buildWords(r),
      translations: [
        {
          text: (r.translatedTextHighlighted || r.translatedText || "").replace(
            /<\/?em>/g,
            "",
          ),
        },
      ],
    }));

  return {
    result: {
      verses,
      navigation: [],
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages,
      },
    },
  };
}

function buildWords(
  result: KalimatSearchResult,
): { text: string; highlight?: boolean }[] {
  const text = result.textHighlighted || result.text || "";
  if (!text) return [];

  const parts = text.split(/(<em>.*?<\/em>)/g);
  return parts
    .filter((p) => p)
    .map((p) => {
      const isHighlight = p.startsWith("<em>") && p.endsWith("</em>");
      return {
        text: isHighlight ? p.slice(4, -5) : p,
        ...(isHighlight ? { highlight: true } : {}),
      };
    });
}
