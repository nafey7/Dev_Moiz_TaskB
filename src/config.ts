export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  scrapeTimeout: parseInt(process.env.SCRAPE_TIMEOUT || '20000', 10),

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },

  isProduction(): boolean {
    return this.nodeEnv === 'production';
  },

  isTest(): boolean {
    return this.nodeEnv === 'test';
  },
};
