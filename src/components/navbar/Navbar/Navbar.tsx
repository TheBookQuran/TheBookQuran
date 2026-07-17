"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import { useUIStore } from "@/stores/ui";
import { useThemeStore } from "@/stores/theme";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { useToggleLocale } from "@/hooks/use-toggle-locale";
import styles from "./Navbar.module.css";
import clsx from "clsx";

const ThemeIcon: React.FC<{ themeId: string; size?: number }> = ({ themeId, size = 20 }) => {
  switch (themeId) {
    case "light":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      );
    case "dark":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      );
    case "sepia":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      );
    case "system":
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
        </svg>
      );
  }
};

export const Navbar: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("common");
  const settingsT = useTranslations("settings");
  const pathname = usePathname();
  const router = useRouter();

  const setSearchDrawerOpen = useUIStore((state) => state.setSearchDrawerOpen);
  const isSearchDrawerOpen = useUIStore((state) => state.isSearchDrawerOpen);

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const resolvedTheme = useResolvedTheme();



  const toggleLanguage = useToggleLocale();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href={`/${locale}`} className={styles.brand}>
            <span>Quran</span>
          </Link>
          <div className={styles.navLinks}>
            {/* ميزات قادمة لاحقاً: صفحات الاستماع والملاحظات أو التدوين */}
            {/*
            <Link href={`/${locale}/my-quran`} className={styles.link}>
              {t("journal")}
            </Link>
            <Link href={`/${locale}/reciters`} className={styles.link}>
              {t("reciters")}
            </Link>
            */}
          </div>
        </div>

        <div className={styles.right}>
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            title={locale === "en" ? "العربية" : "English"}
          >
            {locale === "en" ? "ar" : "en"}
          </button>

          {/* Theme Dropdown Trigger via Radix Popover */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className={styles.iconButton}
                title={locale === "en" ? "Theme settings" : "إعدادات المظهر"}
                aria-label="Theme settings"
              >
                <ThemeIcon themeId={theme} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className={styles.popoverContent} sideOffset={8} align="end">
                <div className={styles.themeMenu}>
                  {[
                    { id: "light", name: settingsT("themeLight") },
                    { id: "dark", name: settingsT("themeDark") },
                    { id: "sepia", name: settingsT("themeSepia") },
                    { id: "system", name: settingsT("themeSystem") },
                  ].map((item) => (
                    <Popover.Close key={item.id} asChild>
                      <button
                        onClick={() => setTheme(item.id as any)}
                        className={clsx(styles.menuItem, {
                          [styles.activeMenuItem]: theme === item.id,
                        })}
                      >
                        <div className={clsx(styles.themeIconContainer, styles[`themeIcon_${item.id}`])}>
                          <ThemeIcon themeId={item.id} size={18} />
                        </div>
                        <span>{item.name}</span>
                        {theme === item.id && (
                          <svg
                            className={styles.checkIcon}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    </Popover.Close>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          
          {/* Search Trigger Button */}
          <button
            className={styles.iconButton}
            onClick={() => setSearchDrawerOpen(!isSearchDrawerOpen)}
            aria-label={t("search")}
            title={t("search")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
