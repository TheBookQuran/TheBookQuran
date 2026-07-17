import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly resultsList: Locator;
  readonly seeAllBtn: Locator;

  constructor(page: Page) {
    super(page);
    // Target search input specifically inside the dialog to avoid homepage search input conflicts
    this.searchInput = page.locator("[role='dialog'] input[type='text']");
    this.resultsList = page.locator("[role='dialog'] div[class*='resultsList']").first();
    this.seeAllBtn = page.locator("[role='dialog'] button[class*='seeAllButton']").first();
  }

  async openSearch() {
    const dialog = this.page.locator("[role='dialog']");
    if (!(await dialog.isVisible())) {
      await this.searchToggleBtn.click();
      await dialog.waitFor({ state: "visible", timeout: 5000 });
    }
  }

  async search(query: string) {
    await this.openSearch();
    await this.searchInput.fill(query);
    // Wait for results list to become visible
    await this.resultsList.waitFor({ state: "visible", timeout: 10000 });
  }

  async getResultCard(verseKey: string): Promise<Locator> {
    return this.page.locator(`[role='dialog'] a[class*='resultCard']:has-text("${verseKey}")`).first();
  }

  async clickResult(verseKey: string) {
    const card = await this.getResultCard(verseKey);
    await card.click();
  }
}
