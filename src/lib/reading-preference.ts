import { cookies } from "next/headers";
import { ReadingPreference } from "@/types/settings";

export async function getReadingPreference(locale?: string): Promise<ReadingPreference> {
  const cookieStore = await cookies();
  const pref = cookieStore.get("reading-pref")?.value;
  if (pref === ReadingPreference.Reading) return ReadingPreference.Reading;
  if (pref === ReadingPreference.ReadingTranslation) return ReadingPreference.ReadingTranslation;
  if (pref === ReadingPreference.Translation) return ReadingPreference.Translation;
  return locale === "ar" ? ReadingPreference.Reading : ReadingPreference.Translation;
}
