/**
 * Playwright Configuration for Lit Component Library
 *
 * This example shows how to configure the component testing runtime
 * to work with a Lit component library.
 *
 * Prerequisites:
 * 1. Build your Lit components: `npm run build`
 * 2. Ensure dist/ contains your bundled components
 * 3. Run tests: `npx playwright test`
 */

import { defineConfig, devices } from '@playwright/test';
import { withComponentTesting } from '@wc-tools/webrun';

export default withComponentTesting({
  /**
   * Port for the development server
   */
  port: 3000,

  /**
   * Directory containing your Lit build output
   */
  staticDir: './dist',

  /**
   * Auto-start the web server (recommended for CI/CD)
   */
  autoStart: true,

  /**
   * Load your Lit component bundle
   * This file should contain all your web component definitions
   */
  scripts: [
    '/my-components.js', // Replace with your bundle name
  ],

  /**
   * Import map for Lit and other dependencies
   * This allows your components to import from CDN
   */
  importMap: {
    imports: {
      'lit': 'https://cdn.jsdelivr.net/npm/lit@3/+esm',
      'lit/': 'https://cdn.jsdelivr.net/npm/lit@3/',
      '@lit/reactive-element': 'https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/+esm',
      'lit-html': 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm',
      'lit-element': 'https://cdn.jsdelivr.net/npm/lit-element@4/+esm',
    },
  },

  /**
   * Optional: Load global styles
   */
  stylesheets: [
    '/styles/global.css', // If you have global styles
  ],
})(
  defineConfig({
    testDir: './test',
    fullyParallel: true,

    /**
     * Test timeout (increase if components are slow to load)
     */
    timeout: 30000,

    use: {
      /**
       * Collect trace on first retry for debugging
       */
      trace: 'on-first-retry',

      /**
       * Take screenshot on failure
       */
      screenshot: 'only-on-failure',
    },

    /**
     * Test against multiple browsers
     */
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ],

    /**
     * Optional: Custom web server configuration
     * Uncomment to override the default http-server
     */
    // webServer: {
    //   command: 'npx vite preview --port 3000',
    //   port: 3000,
    //   reuseExistingServer: !process.env.CI,
    // },
  })
);
