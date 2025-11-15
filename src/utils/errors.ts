export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class InvalidURLError extends AppError {
  constructor(message: string = 'Invalid URL') {
    super(message, 400);
    Object.setPrototypeOf(this, InvalidURLError.prototype);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Timeout') {
    super(message, 504);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ScrapingError extends AppError {
  constructor(message: string = 'Scraping failed', statusCode: number = 500) {
    super(message, statusCode);
    Object.setPrototypeOf(this, ScrapingError.prototype);
  }
}

export class NavigationError extends AppError {
  constructor(message: string = 'Failed to load page', statusCode: number = 502) {
    super(message, statusCode);
    Object.setPrototypeOf(this, NavigationError.prototype);
  }
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }
  return false;
}

export function isNavigationError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('net::') ||
      message.includes('navigation') ||
      message.includes('unreachable') ||
      message.includes('failed to load page')
    );
  }
  return false;
}
