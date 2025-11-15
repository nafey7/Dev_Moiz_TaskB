import { isURL } from 'validator';
import { ScrapedData } from '../types/index';

export function validateURL(url: string): boolean {
  return isURL(url.trim(), {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
}

export function sanitizeURL(url: string): string {
  return url.trim();
}

export function validateScrapedData(data: unknown): data is ScrapedData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!('title' in obj) || !('metaDescription' in obj) || !('h1' in obj) || !('status' in obj)) {
    return false;
  }

  const { title, metaDescription, h1, status } = obj;

  if (
    (title !== null && typeof title !== 'string') ||
    (metaDescription !== null && typeof metaDescription !== 'string') ||
    (h1 !== null && typeof h1 !== 'string')
  ) {
    return false;
  }

  if (typeof status !== 'number') {
    return false;
  }

  if (status < 100 || status > 599) {
    return false;
  }

  return true;
}
