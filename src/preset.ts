import type { PlaywrightTestConfig } from '@playwright/test';

export interface ComponentTestingPresetOptions {
  /**
   * Port for the development server (default: 3000)
   */
  port?: number;

  /**
   * Host for the development server (default: 'localhost')
   */
  host?: string;

  /**
   * Static files directory to serve (default: './public')
   *
   * This directory should contain your web component library build output.
   * Common paths:
   * - Stencil: './dist' (contains loader + ESM components)
   * - Lit: './dist' (contains your built components)
   * - Custom: Any directory with your component files
   *
   * The web server will serve files from this directory, making them accessible
   * via the baseURL in your tests.
   */
  staticDir?: string;

  /**
   * Whether to automatically start the web server (default: true)
   * Set to false if you want to manage the server manually or use a custom web server
   */
  autoStart?: boolean;

  /**
   * Additional http-server options (optional)
   * Example: '--silent' to suppress logs
   */
  serverOptions?: string;

  /**
   * Global CSS files to include in all rendered components
   * Can be URLs or file paths relative to baseURL
   *
   * Example:
   * - ['/styles/global.css'] - Served from staticDir
   * - ['https://cdn.example.com/styles.css'] - External CDN
   */
  stylesheets?: string[];

  /**
   * Global JavaScript files to include in all rendered components
   * Can be URLs or file paths relative to baseURL
   *
   * Common use cases:
   * - Stencil loader: ['/build/my-component-library.esm.js']
   * - Lit components: ['/my-component-library.js']
   * - Polyfills: ['/polyfills/webcomponents.js']
   */
  scripts?: string[];

  /**
   * Inline CSS to include in all rendered components
   */
  globalStyles?: string;

  /**
   * Import map for ES modules
   * Useful for aliasing module paths and CDN imports
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
   *
   * Example:
   * ```typescript
   * importMap: {
   *   imports: {
   *     'lit': 'https://cdn.jsdelivr.net/npm/lit@3/+esm',
   *     '@my-lib/': '/components/'
   *   }
   * }
   * ```
   */
  importMap?: {
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
  };

  /**
   * Enable automatic visual regression testing (autoVRT)
   * When enabled, automatically captures screenshots after each assertion
   * Screenshots are attached to the test report and can be used for visual regression testing
   *
   * Default: false
   *
   * Example:
   * ```typescript
   * withComponentTesting({
   *   autoVrt: true,
   *   // ... other options
   * })
   * ```
   */
  autoVrt?: boolean;

  /**
   * Initial element to wait for after rendering (default: undefined)
   * Waits for ALL matching elements with this selector to be visible before proceeding
   * Useful for waiting for component hydration or initialization
   *
   * Note: Waits for ALL elements matching the selector, not just the first one.
   * This ensures all components on the page are ready before tests run.
   *
   * Example (Stencil hydration - waits for all .hydrated components):
   * ```typescript
   * withComponentTesting({
   *   initialWaitForElement: '.hydrated',
   *   // ... other options
   * })
   * ```
   *
   * Example (Custom Elements defined):
   * ```typescript
   * withComponentTesting({
   *   initialWaitForElement: 'my-component',
   *   // ... other options
   * })
   * ```
   */
  initialWaitForElement?: string;

  /**
   * Custom web server configuration
   * Allows you to override the default web server settings
   *
   * If provided, this will be merged with the auto-generated webServer config
   * Useful for custom server commands or advanced configuration
   */
  webServer?: Partial<PlaywrightTestConfig['webServer']>;
}

/**
 * Higher-order function that wraps Playwright configuration with component testing capabilities
 *
 * @param options - Configuration options for the component testing runtime
 * @returns A function that takes a Playwright config and returns an enhanced config
 *
 * @example Basic usage
 * ```typescript
 * import { defineConfig } from '@playwright/test';
 * import { withComponentTesting } from '@wc-tools/webrun';
 *
 * export default withComponentTesting({
 *   port: 3000,
 *   staticDir: './public'
 * })(defineConfig({
 *   testDir: './test'
 * }));
 * ```
 *
 * @example Stencil component library
 * ```typescript
 * export default withComponentTesting({
 *   port: 3000,
 *   staticDir: './dist', // Stencil build output
 *   scripts: [
 *     '/build/my-component-library.esm.js' // Stencil loader
 *   ]
 * })(defineConfig({
 *   testDir: './test'
 * }));
 * ```
 *
 * @example Lit component library
 * ```typescript
 * export default withComponentTesting({
 *   port: 3000,
 *   staticDir: './dist', // Lit build output
 *   scripts: [
 *     '/my-components.js' // Your bundled Lit components
 *   ],
 *   importMap: {
 *     imports: {
 *       'lit': 'https://cdn.jsdelivr.net/npm/lit@3/+esm'
 *     }
 *   }
 * })(defineConfig({
 *   testDir: './test'
 * }));
 * ```
 *
 * @example Custom web server configuration
 * ```typescript
 * export default withComponentTesting({
 *   port: 3000,
 *   staticDir: './dist',
 *   webServer: {
 *     command: 'npm run serve', // Use your own server command
 *     timeout: 60000
 *   }
 * })(defineConfig({
 *   testDir: './test'
 * }));
 * ```
 *
 * @example Override defaults in Playwright config
 * ```typescript
 * export default withComponentTesting({
 *   port: 3000,
 *   autoStart: true
 * })(defineConfig({
 *   testDir: './test',
 *   webServer: {
 *     // This will override the auto-generated webServer config
 *     command: 'vite preview --port 3000',
 *     reuseExistingServer: true
 *   }
 * }));
 * ```
 */
export function withComponentTesting(options: ComponentTestingPresetOptions = {}) {
  const {
    port = 3000,
    host = 'localhost',
    staticDir = './public',
    autoStart = true,
    serverOptions = '',
    stylesheets = [],
    scripts = [],
    globalStyles = '',
    importMap,
    autoVrt = false,
    initialWaitForElement,
    webServer: customWebServer,
  } = options;

  return function <T extends PlaywrightTestConfig>(config: T): T {
    const baseURL = `http://${host}:${port}`;

    const enhancedConfig: T = {
      ...config,
      use: {
        ...config.use,
        baseURL: config.use?.baseURL ?? baseURL,
        // Bypass CSP for component testing with setContent()
        bypassCSP: config.use?.bypassCSP ?? true,
        // Disable web security to allow scripts from null origin
        // This is necessary because setContent() creates pages with null origin
        launchOptions: {
          ...(config.use?.launchOptions || {}),
          args: [
            ...(config.use?.launchOptions?.args || []),
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--allow-file-access-from-files',
            '--allow-running-insecure-content',
            '--disable-features=IsolateOrigins,site-per-process,BlockInsecurePrivateNetworkRequests',
          ],
        },
        // Store component testing config in use context
        componentTesting: {
          stylesheets,
          scripts,
          globalStyles,
          ...(importMap ? { importMap } : {}),
          autoVrt,
          ...(initialWaitForElement ? { initialWaitForElement } : {}),
        },
      },
    };

    // Build web server config
    if (autoStart) {
      const command = `npx http-server ${staticDir} -p ${port} -a ${host} --cors ${serverOptions}`.trim();

      const defaultWebServer = {
        command,
        url: baseURL,
        reuseExistingServer: !process.env['CI'],
        timeout: 120000,
      };

      // Merge: customWebServer from options > config.webServer > defaultWebServer
      enhancedConfig.webServer = {
        ...defaultWebServer,
        ...customWebServer,
        ...config.webServer,
      };
    } else {
      // If autoStart is false, only use config.webServer (no defaults)
      if (config.webServer) {
        enhancedConfig.webServer = config.webServer;
      }
    }

    return enhancedConfig;
  };
}

/**
 * Get the base URL for the component testing server
 * This is useful for accessing the server URL in tests
 */
export function getBaseURL(options: ComponentTestingPresetOptions = {}): string {
  const { port = 3000, host = 'localhost' } = options;
  return `http://${host}:${port}`;
}
