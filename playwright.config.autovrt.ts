import { defineConfig } from '@playwright/test';
import { withComponentTesting } from './src/preset.js';

export default withComponentTesting({
  port: 3001,
  staticDir: './test',
  autoStart: false,
  autoVrt: true, // Enable automatic visual regression testing
})(
  defineConfig({
    testDir: './test',
    testMatch: 'autovrt.spec.tsx',
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
