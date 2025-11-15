import puppeteer, { Browser, Page } from 'puppeteer';
import { ScrapedData, ScrapingOptions } from '../types/index';
import {
  TimeoutError,
  ScrapingError,
  NavigationError,
  isTimeoutError,
  isNavigationError,
} from '../utils/errors';

const DEFAULT_TIMEOUT = 20000;
const DEFAULT_WAIT_UNTIL: 'networkidle0' | 'domcontentloaded' = 'networkidle0';
const MAX_RETRIES = 1;

export class ScraperService {
  private browser: Browser | null = null;

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--single-process',
        ],
      });
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeURL(
    url: string,
    options: ScrapingOptions = {},
  ): Promise<ScrapedData> {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const waitUntil = options.waitUntil || DEFAULT_WAIT_UNTIL;

    let page: Page | null = null;
    let retries = 0;

    try {
      await this.initBrowser();

      if (!this.browser) {
        throw new ScrapingError('Browser initialization failed');
      }

      while (retries <= MAX_RETRIES) {
        try {
          page = await this.browser.newPage();

          await page.setViewport({ width: 1280, height: 720 });
          page.setDefaultTimeout(timeout);
          page.setDefaultNavigationTimeout(timeout);

          try {
            await page.goto(url, {
              waitUntil: waitUntil,
              timeout: timeout,
            });
          } catch (error) {
            if (isNavigationError(error) && retries < MAX_RETRIES) {
              retries++;
              if (page) {
                await page.close();
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
              continue;
            }
            throw error;
          }

          const data = await page.evaluate(() => {
            const title =
              document.title ||
              document.querySelector('title')?.textContent ||
              null;

            const metaDescription =
              document
                .querySelector('meta[name="description"]')
                ?.getAttribute('content') || null;

            const h1 = document.querySelector('h1')?.textContent?.trim() || null;

            return {
              title,
              metaDescription,
              h1,
            };
          });

          return {
            ...data,
            status: 200,
          };
        } catch (error) {
          if (retries < MAX_RETRIES) {
            retries++;
            if (page) {
              await page.close();
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            continue;
          }
          throw error;
        }
      }

      throw new ScrapingError('Failed to scrape after retries');
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new TimeoutError('Request timeout while scraping page');
      }

      if (isNavigationError(error)) {
        throw new NavigationError('Failed to load page', 502);
      }

      if (error instanceof ScrapingError || error instanceof TimeoutError || error instanceof NavigationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ScrapingError(
        `Failed to scrape URL: ${errorMessage}`,
        500,
      );
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          console.error('Error closing page:', error);
        }
      }
    }
  }
}

// Export singleton instance
export const scraperService = new ScraperService();
