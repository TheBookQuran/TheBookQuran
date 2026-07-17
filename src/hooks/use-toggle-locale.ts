import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function useToggleLocale() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(() => {
    const nextLocale = locale === "en" ? "ar" : "en";
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = nextLocale;
      router.push(segments.join("/"));
    } else {
      router.push(`/${nextLocale}`);
    }
  }, [locale, pathname, router]);
}
