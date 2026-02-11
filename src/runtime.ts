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
import { setPageContext, setAutoVrtEnabled, expectWithScreenshots } from './utils/expect-extensions.js';

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
    // Get component testing config from Playwright context
    const projectUse = testInfo.project.use as { componentTesting?: ComponentTestingConfig };
    const config = projectUse.componentTesting || {};

    // Set up page context and autoVrt for expect extensions
    setPageContext(page);
    setAutoVrtEnabled(config.autoVrt || false);

    // Get baseURL from test config
    const baseURL = testInfo.project.use.baseURL || 'http://localhost:3000';

    const renderFunction = async (component: string | JSXElement | LitTemplateResult, options?: RenderOptions): Promise<RenderResult> => {
      // Build render context
      const context: RenderContext = {
        stylesheets: config.stylesheets || [],
        scripts: config.scripts || [],
        globalStyles: config.globalStyles || '',
        ...(config.importMap ? { importMap: config.importMap } : {}),
        baseURL
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
});

/**
 * Unmount the rendered component
 */
async function unmount(page: Page): Promise<void> {
  await page.evaluate(() => {
    const containerElement = document.querySelector('body > *:first-child');
    if (containerElement) {
      containerElement.remove();
    }
  });
}

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
 * Export expect with autoVrt support
 * Uses the extended expect that captures screenshots when autoVrt is enabled
 */
export const expect = expectWithScreenshots;
