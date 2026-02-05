import { defineConfig } from '@playwright/test';
import { withComponentTesting } from './src/preset.js';

export default withComponentTesting({
  port: 3002,
  staticDir: './test',
  autoStart: false,
  initialWaitForElement: '.hydrated', // Wait for Stencil hydration class
})(
  defineConfig({
    testDir: './test',
    testMatch: 'initial-wait.spec.tsx',
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: {
      trace: 'off',
      video: 'off',
    },
    projects: [
      {
        name: 'chromium',
        use: { browserName: 'chromium' },
      },
    ],
  })
);
