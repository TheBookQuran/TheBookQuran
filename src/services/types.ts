export * from "../types/api";

export interface SearchRequestParams {
  query: string;
  filterLanguages?: string;
  size?: number;
  page?: number;
}

export interface SearchNavigationResult {
  resultType: "ayah" | "chapter" | "juz";
  key: string;
  name: string;
  arabic?: string;
  isTranslation?: boolean;
}

export interface SearchVerseResult {
  verseKey: string;
  translations?: { text: string; resourceName?: string }[];
  words?: { text: string }[];
}

export interface NewSearchResponse {
  result?: {
    navigation?: SearchNavigationResult[];
    verses?: SearchVerseResult[];
    pagination?: {
      totalRecords: number;
      currentPage: number;
      totalPages: number;
    };
  };
}

export interface RecitersResponse {
  reciters: {
    id: number;
    name: string;
    recitationStyle: string;
    relativePath: string;
    profilePicture?: string;
    coverImage?: string;
    bio?: string;
    translatedName?: {
      name: string;
      languageName: string;
    };
  }[];
}

export interface ReciterResponse {
  reciter: {
    id: number;
    name: string;
    recitationStyle: string;
    relativePath: string;
    profilePicture?: string;
    coverImage?: string;
    bio?: string;
    translatedName?: {
      name: string;
      languageName: string;
    };
  };
}

export interface TranslationsResponse {
  translations: {
    id: number;
    name: string;
    authorName: string;
    languageName: string;
    slug: string;
  }[];
}
