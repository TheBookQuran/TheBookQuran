export interface KalimatSearchResponse {
  data: {
    results: KalimatSearchResult[];
    totalResultsNum: number;
  };
  meta: {
    version: string;
  };
}

export interface KalimatSearchResult {
  id: string;
  type: string;
  text?: string;
  textHighlighted?: string;
  translatedText?: string;
  translatedTextHighlighted?: string;
  isTransliteration?: boolean;
}
