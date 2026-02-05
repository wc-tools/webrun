import { defineConfig, devices } from '@playwright/test';
import { withComponentTesting } from './src/index.js';

export default withComponentTesting({
  port: 3000,
  host: 'localhost',
  staticDir: './', // Serve from project root to access test files
  autoStart: true,  // Enable auto-start for serving test files
})(defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}));
