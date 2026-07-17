import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly langToggleBtn: Locator;
  readonly themeToggleBtn: Locator;
  readonly searchToggleBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    // Scope selectors to the navbar "nav" tag to avoid strict mode violations (matching footer buttons)
    this.langToggleBtn = page.locator("nav button[class*='langToggle']").first();
    this.themeToggleBtn = page.locator("nav button[aria-label='Theme settings'], nav button[title='Theme settings'], nav button[title='إعدادات المظهر']").first();
    this.searchToggleBtn = page.locator("nav button[aria-label='Search'], nav button[aria-label='بحث'], nav button[title='Search'], nav button[title='بحث']").first();
  }

  async goto(path = "/") {
    await this.page.goto(path);
  }

  async toggleLanguage() {
    await this.langToggleBtn.click();
  }

  async changeTheme(theme: "light" | "dark" | "sepia" | "system") {
    await this.themeToggleBtn.click();
    // Locate the theme button inside the popover menu
    const themeOption = this.page.locator(`[role="dialog"] button[class*='menuItem']:has-text("${theme}"), [role="dialog"] button[class*='menuItem']:has-text("${this.getThemeArabic(theme)}")`).first();
    await themeOption.click();
  }

  private getThemeArabic(theme: string): string {
    switch (theme) {
      case "light": return "فاتح";
      case "dark": return "داكن";
      case "sepia": return "سيبيا";
      default: return "تلقائي";
    }
  }
}
