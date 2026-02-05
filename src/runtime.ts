import { test as base, type Page, expect as baseExpect } from '@playwright/test';
import { render as renderComponent } from './renderers/index.js';
import type { RenderContext } from './renderers/index.js';
import type {
  JSXElement,
  LitTemplateResult,
  ComponentTestingConfig,
  RenderResult,
  ComponentTestFixtures,
  RenderOptions
} from './runtime.types.js';
import { extendLocator } from './utils/locator-extensions.js';
import { createExpectWithScreenshots } from './utils/expect-extensions.js';

export type {
  JSXElement,
  LitTemplateResult,
  ComponentTestingConfig,
  RenderResult,
  ComponentTestFixtures,
  RenderOptions
};


/**
 * Extended test object with component testing capabilities
 */
export const test = base.extend<ComponentTestFixtures>({
  render: async (
    { page }: { page: Page },
    use: (r: (component: string | JSXElement | LitTemplateResult, options?: RenderOptions) => Promise<RenderResult>) => Promise<void>,
    testInfo
  ) => {
    const renderFunction = async (component: string | JSXElement | LitTemplateResult, options?: RenderOptions): Promise<RenderResult> => {
      // Get component testing config from Playwright context
      const projectUse = testInfo.project.use as { componentTesting?: ComponentTestingConfig };
      const config = projectUse.componentTesting || {};

      // Build render context
      const context: RenderContext = {
        stylesheets: config.stylesheets || [],
        scripts: config.scripts || [],
        globalStyles: config.globalStyles || '',
        ...(config.importMap ? { importMap: config.importMap } : {})
      };

      // Use functional renderer system to generate HTML
      const { html } = await renderComponent(component, context);
      await page.setContent(html);

      // Wait for initial element if configured
      if (config.initialWaitForElement) {
        await waitForInitialElements(page, config.initialWaitForElement, options?.skipVisibilityCheck);
      }

      return {
        container: extendLocator(page.locator('body > *:first-child')),
        unmount: () => unmount(page),
      };
    };

    await use(renderFunction);
  },

  expect: async ({ page }, use, testInfo) => {
    // Get component testing config from Playwright context
    const projectUse = testInfo.project.use as { componentTesting?: ComponentTestingConfig };
    const config = projectUse.componentTesting || {};

    // If autoVrt is enabled, use the screenshot-enhanced expect
    if (config.autoVrt) {
      const expectWithScreenshots = createExpectWithScreenshots(page);
      await use(expectWithScreenshots);
    } else {
      // Otherwise, use the standard expect
      await use(baseExpect);
    }
  },
});

/**
 * Unmount the rendered component
 */
async function unmount(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Clear the first container div in body
    const containerElement = document.querySelector('body > div:first-child');
    if (containerElement) {
      containerElement.innerHTML = '';
    }
  });
}``

/**
 * Wait for all elements matching the selector to be visible or attached
 */
async function waitForInitialElements(
  page: Page,
  selector: string,
  skipVisibilityCheck?: boolean
): Promise<void> {
  const initialElements = page.locator(selector);
  const count = await initialElements.count();

  // Wait for all matching elements to be visible/attached
  for (let i = 0; i < count; i++) {
    const element = initialElements.nth(i);

    if (skipVisibilityCheck) {
      await baseExpect(element).toBeAttached();
    } else {
      await baseExpect(element).toBeVisible();
    }
  }
}

/**
 * Export expect from the test fixtures
 * This automatically includes autoVrt functionality when enabled in the configuration
 */
export const { expect } = test;
