import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DealsPage extends BasePage {
  readonly createDealButton: Locator;
  readonly searchInput: Locator;
  readonly pipelineView: Locator;

  constructor(page: Page) {
    super(page);
    this.createDealButton = page.getByRole('button', { name: /add deal|new deal/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.pipelineView = page.locator('.kanban-board').or(page.getByTestId('pipeline-view'));
  }

  async goto(): Promise<void> {
    await this.navigate('/deals');
  }

  async createDeal(dealName: string): Promise<void> {
    await this.createDealButton.click();
    // Assuming a modal opens with a name input
    const nameInput = this.page.getByLabel(/deal name/i);
    await nameInput.fill(dealName);
    await this.page.getByRole('button', { name: /save|create/i }).click();
  }
}
