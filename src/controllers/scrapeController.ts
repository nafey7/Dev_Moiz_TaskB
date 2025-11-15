import { Request, Response, NextFunction } from 'express';
import { scraperService } from '../services/scraper';
import { validateURL, sanitizeURL, validateScrapedData } from '../utils/validation';
import {
  InvalidURLError,
  TimeoutError,
  ScrapingError,
  NavigationError,
  AppError,
} from '../utils/errors';
import { ScrapedData, ErrorResponse } from '../types/index';
import { config } from '../config';

export async function scrapeHandler(
  req: Request,
  res: Response<ScrapedData | ErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string' || !url.trim()) {
      throw new InvalidURLError('Missing URL parameter');
    }

    if (!validateURL(url)) {
      throw new InvalidURLError('Invalid URL');
    }

    const sanitizedUrl = sanitizeURL(url);
    const data = await scraperService.scrapeURL(sanitizedUrl, {
      timeout: config.scrapeTimeout,
      waitUntil: 'networkidle0',
    });

    if (!validateScrapedData(data)) {
      throw new ScrapingError('Failed to validate scraped data');
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
