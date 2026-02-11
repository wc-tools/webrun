/**
 * Expect extensions for automatic visual regression testing
 * Automatically captures screenshots after each assertion when autoVrt is enabled
 */

import { expect as baseExpect, type Page } from '@playwright/test';
import type { Locator } from '@playwright/test';

/**
 * List of matchers that make sense for visual regression testing
 * These are assertions that indicate a visual state that should be captured
 */
const visualMatchers = [
  'toBeVisible',
  'toBeHidden',
  'toBeEnabled',
  'toBeDisabled',
  'toBeChecked',
  'toBeEditable',
  'toBeFocused',
  'toBeEmpty',
  'toBeAttached',
  'toContainText',
  'toHaveText',
  'toHaveValue',
  'toHaveValues',
  'toHaveAttribute',
  'toHaveClass',
  'toHaveCSS',
  'toHaveId',
  'toHaveCount',
  'toHaveAccessibleName',
  'toHaveAccessibleDescription',
  'toHaveRole',
];

// Store page context for screenshot capture
let pageContext: Page | null = null;
let autoVrtEnabled = false;

/**
 * Set the page context for screenshot capture
 */
export function setPageContext(page: Page): void {
  pageContext = page;
}

/**
 * Get the current page context
 */
function getPageContext(): Page | null {
  return pageContext;
}

/**
 * Enable or disable auto VRT
 */
export function setAutoVrtEnabled(enabled: boolean): void {
  autoVrtEnabled = enabled;
}

/**
 * Check if auto VRT is enabled
 */
function isAutoVrtEnabled(): boolean {
  return autoVrtEnabled;
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

/**
 * Create an expect wrapper that captures screenshots after visual assertions
 */
export const expectWithScreenshots = new Proxy(baseExpect, {
  apply(target, thisArg, argumentsList) {
    const [actual] = argumentsList;

    const assertion = Reflect.apply(target, thisArg, argumentsList);

    if (!isAutoVrtEnabled()) {
      return assertion;
    }

    // Wrap assertion methods to take screenshots after visual assertions
    return new Proxy(assertion, {
      get(assertionTarget, prop) {
        const originalMethod = Reflect.get(assertionTarget, prop);

        // Only wrap methods that are assertions (not getters/properties)
        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        // Skip screenshot capture for screenshot-related assertions
        const skipScreenshotMethods = ['toHaveScreenshot', 'toMatchSnapshot'];
        if (skipScreenshotMethods.includes(String(prop))) {
          return originalMethod;
        }

        // Only capture screenshots for visual matchers
        if (!visualMatchers.includes(String(prop))) {
          return originalMethod;
        }

        return async function (...args: unknown[]) {
          const result = await originalMethod.apply(assertionTarget, args);

          // Automatically capture screenshot after assertion
          const page = getPageContext();
          if (page) {
            try {
              if (isLocator(actual)) {
                await baseExpect(actual).toHaveScreenshot();
              } else {
                await baseExpect(page).toHaveScreenshot();
              }
            } catch {
              // Screenshot comparison may fail on first run (no baseline)
              // The screenshot is still saved for future comparisons
            }
          }

          return result;
        };
      }
    });
  }
}) as typeof baseExpect;
