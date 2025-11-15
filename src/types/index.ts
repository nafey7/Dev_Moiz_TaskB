/**
 * Response type for successful scraping operations
 */
export interface ScrapedData {
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  status: number;
}

/**
 * Response type for error responses
 * Consistent structure: { "error": "message" }
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Scraping options
 */
export interface ScrapingOptions {
  timeout?: number;
  waitUntil?: 'networkidle0' | 'networkidle2' | 'domcontentloaded';
}

/**
 * Application configuration
 */
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  scrapeTimeout: number;
}
