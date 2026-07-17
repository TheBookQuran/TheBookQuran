export enum CharType {
  Word = "word",
  End = "end",
  Pause = "pause",
  Sajdah = "sajdah",
  RubElHizb = "rub-el-hizb",
}

export interface WordVerse {
  verseNumber: number;
  verseKey: string;
  chapterId: number | string;
  translationsLabel?: string;
  translationsCount?: number;
}

export interface Translation {
  id?: number;
  resourceId?: number;
  text: string;
  languageName?: string;
  resourceName?: string;
}

export interface Transliteration {
  id?: number;
  languageName?: string;
  text: string;
}

export interface Word {
  verseKey?: string;
  charTypeName: CharType;
  codeV1?: string;
  codeV2?: string;
  pageNumber?: number;
  hizbNumber?: number;
  lineNumber?: number;
  position: number;
  location?: string;
  translation?: Translation;
  transliteration?: Transliteration;
  id?: number;
  textUthmani?: string;
  textIndopak?: string;
  qpcUthmaniHafs?: string;
  highlight?: string | boolean;
  text?: string;
  audioUrl?: string;
  verse?: WordVerse;
}

export interface Verse {
  id: number;
  verseNumber: number;
  chapterId?: number | string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  rubElHizbNumber: number;
  verseKey: string;
  verseIndex: number;
  words: Word[];
  textUthmani?: string;
  textUthmaniSimple?: string;
  textUthmaniTajweed?: string;
  textImlaei?: string;
  textImlaeiSimple?: string;
  textIndopak?: string;
  sajdahNumber?: number | null;
  sajdahType?: string | null;
  v1Page?: number;
  v2Page?: number;
  codeV1?: string;
  codeV2?: string;
  translations?: Translation[];
}

export interface Chapter {
  id: number;
  versesCount: number;
  bismillahPre: boolean;
  revelationOrder: number;
  revelationPlace: string;
  pages: number[];
  nameComplex: string;
  nameSimple: string;
  transliteratedName: string;
  nameArabic: string;
  translatedName: string;
  slug?: string;
}

export enum ScrollAlign {
  Start = "start",
  Center = "center",
  End = "end",
}

