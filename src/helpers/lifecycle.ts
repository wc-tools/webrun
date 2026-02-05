/**
 * Component lifecycle helpers
 */

import type { Page } from '@playwright/test';

/**
 * Wait for a web component to be defined
 */
export async function waitForComponent(
  page: Page,
  componentName: string,
  timeout = 5000
): Promise<void> {
  await page.waitForFunction(
    (name) => customElements.get(name) !== undefined,
    componentName,
    { timeout }
  );
}

/**
 * Check if a web component is defined
 */
export async function isComponentDefined(
  page: Page,
  componentName: string
): Promise<boolean> {
  return await page.evaluate(
    (name) => customElements.get(name) !== undefined,
    componentName
  );
}
