import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly tabSurah: Locator;
  readonly tabJuz: Locator;
  readonly tabHizb: Locator;
  readonly tabPage: Locator;
  readonly tabSelector: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator("input[placeholder*='Search'], input[placeholder*='ابحث']");
    this.tabSurah = page.locator("button:has-text('Surah'), button:has-text('سورة')");
    this.tabJuz = page.locator("button:has-text('Juz'), button:has-text('الجزء')");
    this.tabHizb = page.locator("button:has-text('Hizb'), button:has-text('الحزب')");
    this.tabPage = page.locator("button:has-text('Page'), button:has-text('الصفحة')");
    this.tabSelector = page.locator("select[class*='tabSelect']"); // Mobiles use a select dropdown
  }

  async searchSurah(query: string) {
    await this.searchInput.fill(query);
  }

  async selectTab(tab: "surah" | "juz" | "hizb" | "page") {
    // If the mobile select is visible, use it. Otherwise, click the button.
    if (await this.tabSelector.isVisible()) {
      await this.tabSelector.selectOption(tab);
    } else {
      switch (tab) {
        case "surah": await this.tabSurah.first().click(); break;
        case "juz": await this.tabJuz.first().click(); break;
        case "hizb": await this.tabHizb.first().click(); break;
        case "page": await this.tabPage.first().click(); break;
      }
    }
  }

  async getSurahCard(id: number | string): Promise<Locator> {
    // Scope to SurahCard_row to avoid the "Continue Reading" or other header links
    return this.page.locator(`a[class*='SurahCard_row'][href$='/${id}'], a[class*='SurahCard_row'][href='/${id}'], a[class*='row'][href$='/${id}']`).first();
  }

  async clickSurahCard(id: number | string) {
    const card = await this.getSurahCard(id);
    await card.click();
  }
}
