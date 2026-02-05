/**
 * Expect extensions for automatic visual regression testing
 * Automatically captures screenshots after each assertion when autoVrt is enabled
 */

import { expect as baseExpect, type Page } from '@playwright/test';
import type { Locator } from '@playwright/test';

/**
 * Create an expect extension that automatically takes screenshots after assertions
 * @param page - The Playwright page instance
 * @returns Extended expect with auto-screenshot functionality
 */
export function createExpectWithScreenshots(page: Page) {
  return new Proxy(baseExpect, {
    apply(target, thisArg, argumentsList) {
      const [actual] = argumentsList;

      // Call the original expect
      const assertion = Reflect.apply(target, thisArg, argumentsList);

      // Wrap all assertion methods to take screenshots after they complete
      return new Proxy(assertion, {
        get(assertionTarget, prop) {
          const originalMethod = Reflect.get(assertionTarget, prop);

          // Only wrap methods that are assertions (not getters/properties)
          if (typeof originalMethod !== 'function') {
            return originalMethod;
          }

          // Skip screenshot capture for screenshot-related assertions
          // These methods already handle screenshot capture and comparison
          const skipScreenshotMethods = ['toHaveScreenshot', 'toMatchSnapshot'];
          if (skipScreenshotMethods.includes(String(prop))) {
            return originalMethod;
          }

          return async function(...args: unknown[]) {
            const result = await originalMethod.apply(assertionTarget, args);

            // Automatically capture screenshot after assertion using toHaveScreenshot
            try {
              if (isLocator(actual)) {
                await baseExpect(actual).toHaveScreenshot();
              } else {
                await baseExpect(page).toHaveScreenshot();
              }
            } catch (error) {
              // Ignore screenshot comparison failures
              // The screenshot is still saved even if comparison fails
            }

            return result;
          };
        }
      });
    }
  });
}

/**
 * Type guard to check if a value is a Playwright Locator
 */
function isLocator(value: unknown): value is Locator {
  return (
    typeof value === 'object' &&
    value !== null &&
    'screenshot' in value &&
    typeof (value as { screenshot: unknown }).screenshot === 'function'
  );
}
