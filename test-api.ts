/**
 * Web Scraper API Test Script
 * Tests all API endpoints with different URLs
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

interface TestCase {
  name: string;
  method: string;
  path: string;
  expectedStatus?: number;
  description?: string;
}

const testCases: TestCase[] = [
  {
    name: 'Missing URL (should return 400)',
    method: 'GET',
    path: '/api/scrape',
    expectedStatus: 400,
    description: 'Test with missing URL parameter',
  },
  {
    name: 'Invalid URL (should return 400)',
    method: 'GET',
    path: '/api/scrape?url=invalid',
    expectedStatus: 400,
    description: 'Test with invalid URL format',
  },
  {
    name: 'Scrape example.com',
    method: 'GET',
    path: '/api/scrape?url=https://example.com',
    expectedStatus: 200,
    description: 'Test scraping a valid domain',
  },
  {
    name: 'Scrape Wikipedia',
    method: 'GET',
    path: '/api/scrape?url=https://www.wikipedia.org',
    expectedStatus: 200,
    description: 'Test scraping Wikipedia',
  },
  {
    name: 'Scrape GitHub',
    method: 'GET',
    path: '/api/scrape?url=https://github.com',
    expectedStatus: 200,
    description: 'Test scraping GitHub',
  },
  {
    name: 'Non-existent domain (may timeout)',
    method: 'GET',
    path: '/api/scrape?url=https://nonexistent-domain-12345.com',
    expectedStatus: 500,
    description: 'Test with non-existent domain (may take time)',
  },
  {
    name: 'Scrape with special characters',
    method: 'GET',
    path: '/api/scrape?url=https://example.com/test?query=hello%20world',
    expectedStatus: 200,
    description: 'Test with URL containing special characters',
  },
];

function makeRequest(testCase: TestCase): Promise<void> {
  return new Promise((resolve) => {
    const urlObj = new URL(testCase.path, BASE_URL);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: testCase.method,
      timeout: 30000, // 30 second timeout
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const statusColor =
          (testCase.expectedStatus && res.statusCode === testCase.expectedStatus)
            ? '\x1b[32m' // green
            : '\x1b[31m'; // red
        const resetColor = '\x1b[0m';

        console.log(`\n${statusColor}✓ ${testCase.name}${resetColor}`);
        console.log(`  Method: ${testCase.method} ${testCase.path}`);
        console.log(`  Status: ${res.statusCode}`);

        if (testCase.expectedStatus) {
          const passed = res.statusCode === testCase.expectedStatus;
          console.log(`  Expected: ${testCase.expectedStatus} ${passed ? '✓ PASS' : '✗ FAIL'}`);
        }

        if (testCase.description) {
          console.log(`  Description: ${testCase.description}`);
        }

        // Log response preview (first 200 chars)
        if (data) {
          const preview = data.length > 200 ? data.substring(0, 200) + '...' : data;
          console.log(`  Response: ${preview}`);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`\n\x1b[31m✗ ${testCase.name}\x1b[0m`);
      console.error(`  Error: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`\n\x1b[33m⚠ ${testCase.name} - Request Timeout\x1b[0m`);
      console.warn(`  Path: ${testCase.path}`);
      console.warn(`  (Server may have timed out processing the request)`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n=====================================');
  console.log('     Web Scraper API Test Suite     ');
  console.log('=====================================');
  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Total Tests: ${testCases.length}\n`);

  const startTime = Date.now();

  for (const testCase of testCases) {
    await makeRequest(testCase);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('     Test Suite Complete');
  console.log(`     Duration: ${duration}s`);
  console.log('=====================================\n');
}

// Run tests
runTests().catch(console.error);
