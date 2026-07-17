import { LinguisticRoot } from "@/types/linguistics";

/**
 * دالة توحيد بيانات الجذور اللغوية من التنسيق الخام (JSON) إلى التنسيق البرمجي الموحد.
 * تضمن هذه الدالة تحويل كافة حقول snake_case إلى camelCase وتقدم fallback ذكي.
 */
export function normalizeRoot(raw: any): LinguisticRoot | null {
  if (!raw) return null;
  return {
    id: raw.id,
    arabicText: raw.arabicText ?? raw.arabic_text,
    occurrencesCount: Number(raw.occurrencesCount ?? raw.occurrences_count ?? 0),
    lanesMeaning: raw.lanesMeaning ?? raw.lanes_meaning ?? raw.lexicalMeaning ?? raw.lexical_meaning,
    maqayisMeaning: raw.maqayisMeaning ?? raw.maqayis_meaning,
    transliteration: raw.transliteration,
  };
}
