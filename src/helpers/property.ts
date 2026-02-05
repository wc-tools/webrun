/**
 * Property management helpers for web components
 */

import type { Page, Locator } from '@playwright/test';
import type { PropertyValue } from './types.js';
import { detectPropertyType } from './utils.js';
import { retry } from './retry.js';

/**
 * Set a property on a web component with automatic type detection
 * For functions, automatically exposes them to the browser context
 */
export async function setProperty(
  page: Page,
  selector: string,
  propertyName: string,
  value: PropertyValue
): Promise<void> {
  const descriptor = detectPropertyType(value);

  if (descriptor.type === 'function') {
    // For functions, create a tracking mechanism in the browser
    await page.evaluate(
      ({ sel, prop }) => {
        const element = document.querySelector(sel) as HTMLElement & Record<string, unknown>;
        if (!element) {
          throw new Error(`Element not found: ${sel}`);
        }

        // Initialize tracking for function calls
        if (!window.__componentHelpers) {
          window.__componentHelpers = {};
        }
        if (!window.__componentHelpers.functionCalls) {
          window.__componentHelpers.functionCalls = {};
        }

        const callId = `${sel}:${prop}`;
        window.__componentHelpers.functionCalls[callId] = [];

        // Create the function wrapper that tracks calls
        element[prop] = (...args: unknown[]) => {
          if (window.__componentHelpers?.functionCalls?.[callId]) {
            window.__componentHelpers.functionCalls[callId].push({
              timestamp: Date.now(),
              args: args
            });
          }
          return args;
        };
      },
      { sel: selector, prop: propertyName }
    );
  } else {
    // For non-functions, set the property directly
    await page.evaluate(
      ({ sel, prop, val }) => {
        const element = document.querySelector(sel) as HTMLElement & Record<string, unknown>;
        if (!element) {
          throw new Error(`Element not found: ${sel}`);
        }
        element[prop] = val;
      },
      { sel: selector, prop: propertyName, val: value }
    );
  }
}

/**
 * Get a property value from a web component with automatic retry
 * Retries until the property is set or timeout is reached
 *
 * @overload
 * Get property using a Page and CSS selector
 */
export async function getProperty<T = unknown>(
  page: Page,
  selector: string,
  propertyName: string,
  options?: {
    timeout?: number;
    interval?: number;
    predicate?: (value: T) => boolean;
  }
): Promise<T>;

/**
 * @overload
 * Get property using a Locator
 */
export async function getProperty<T = unknown>(
  locator: Locator,
  propertyName: string,
  options?: {
    timeout?: number;
    interval?: number;
    predicate?: (value: T) => boolean;
  }
): Promise<T>;

export async function getProperty<T = unknown>(
  pageOrLocator: Page | Locator,
  selectorOrPropertyName: string,
  propertyNameOrOptions?: string | {
    timeout?: number;
    interval?: number;
    predicate?: (value: T) => boolean;
  },
  optionsParam?: {
    timeout?: number;
    interval?: number;
    predicate?: (value: T) => boolean;
  }
): Promise<T> {
  // Detect if first param is a Locator
  const isLocator = 'evaluate' in pageOrLocator && !('goto' in pageOrLocator);

  if (isLocator) {
    // Called with (locator, propertyName, options)
    const locator = pageOrLocator as Locator;
    const propertyName = selectorOrPropertyName;
    const options = propertyNameOrOptions as { timeout?: number; interval?: number; predicate?: (value: T) => boolean } | undefined;
    return await getPropertyFromLocator<T>(locator, propertyName, options);
  } else {
    // Called with (page, selector, propertyName, options)
    const page = pageOrLocator as Page;
    const selector = selectorOrPropertyName;
    const propertyName = propertyNameOrOptions as string;
    const options = optionsParam;
    const predicate = options?.predicate;

    return await retry(
      async () => {
        const value = await page.evaluate(
          ({ sel, prop }) => {
            const element = document.querySelector(sel) as HTMLElement & Record<string, unknown>;
            if (!element) {
              throw new Error(`Element not found: ${sel}`);
            }
            return element[prop];
          },
          { sel: selector, prop: propertyName }
        ) as T;

        // If predicate is provided, check if value satisfies it
        if (predicate) {
          if (!predicate(value)) {
            throw new Error(`Predicate not satisfied. Current value: ${JSON.stringify(value)}`);
          }
        } else {
          // If no predicate, check value is not undefined
          if (value === undefined) {
            throw new Error('Property is undefined');
          }
        }

        return value;
      },
      {
        timeout: options?.timeout ?? 5000,
        waitBetweenRetries: async () => await page.waitForTimeout(options?.interval ?? 100),
        errorMessage: predicate
          ? `waiting for property "${propertyName}" on "${selector}" to satisfy predicate`
          : `waiting for property "${propertyName}" on "${selector}" to be defined`
      }
    );
  }
}

/**
 * Set property using a Locator
 */
export async function setPropertyOnLocator(
  locator: Locator,
  propertyName: string,
  value: PropertyValue
): Promise<void> {
  const descriptor = detectPropertyType(value);

  if (descriptor.type === 'function') {
    await locator.evaluate(
      (element, { prop }) => {
        // Initialize tracking
        if (!window.__componentHelpers) {
          window.__componentHelpers = {};
        }
        if (!window.__componentHelpers.functionCalls) {
          window.__componentHelpers.functionCalls = {};
        }

        const callId = `locator:${prop}:${Date.now()}`;
        window.__componentHelpers.functionCalls[callId] = [];

        (element as HTMLElement & Record<string, unknown>)[`__callId_${prop}`] = callId;

        (element as HTMLElement & Record<string, unknown>)[prop] = (...args: unknown[]) => {
          if (window.__componentHelpers?.functionCalls?.[callId]) {
            window.__componentHelpers.functionCalls[callId].push({
              timestamp: Date.now(),
              args: args
            });
          }
          return args;
        };
      },
      { prop: propertyName }
    );
  } else {
    await locator.evaluate(
      (element, { prop, val }) => {
        (element as HTMLElement & Record<string, unknown>)[prop] = val;
      },
      { prop: propertyName, val: value }
    );
  }
}

/**
 * Get property using a Locator with automatic retry
 * Retries until the property is set or timeout is reached
 */
export async function getPropertyFromLocator<T = unknown>(
  locator: Locator,
  propertyName: string,
  options?: {
    timeout?: number;
    interval?: number;
    predicate?: (value: T) => boolean;
  }
): Promise<T> {
  const predicate = options?.predicate;

  return await retry(
    async () => {
      const value = await locator.evaluate(
        (element, prop) => {
          return (element as HTMLElement & Record<string, unknown>)[prop];
        },
        propertyName
      ) as T;

      // If predicate is provided, check if value satisfies it
      if (predicate) {
        if (!predicate(value)) {
          throw new Error(`Predicate not satisfied. Current value: ${JSON.stringify(value)}`);
        }
      } else {
        // If no predicate, check value is not undefined
        if (value === undefined) {
          throw new Error('Property is undefined');
        }
      }

      return value;
    },
    {
      timeout: options?.timeout ?? 5000,
      waitBetweenRetries: async () => await locator.page().waitForTimeout(options?.interval ?? 100),
      errorMessage: predicate
        ? `waiting for property "${propertyName}" to satisfy predicate`
        : `waiting for property "${propertyName}" to be defined`
    }
  );
}

/**
 * Get function call history for a property set via setProperty
 */
export async function getFunctionCalls(
  page: Page,
  selector: string,
  propertyName: string
): Promise<Array<{ timestamp: number; args: unknown[] }>> {
  return await page.evaluate(
    ({ sel, prop }) => {
      const callId = `${sel}:${prop}`;
      return window.__componentHelpers?.functionCalls?.[callId] ?? [];
    },
    { sel: selector, prop: propertyName }
  );
}

/**
 * Clear function call history
 */
export async function clearFunctionCalls(
  page: Page,
  selector: string,
  propertyName: string
): Promise<void> {
  await page.evaluate(
    ({ sel, prop }) => {
      const callId = `${sel}:${prop}`;
      if (window.__componentHelpers?.functionCalls?.[callId]) {
        window.__componentHelpers.functionCalls[callId] = [];
      }
    },
    { sel: selector, prop: propertyName }
  );
}

/**
 * Get all attributes from a web component
 */
export async function getAttributes(
  page: Page,
  selector: string
): Promise<Record<string, string>> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) {
      throw new Error(`Element not found: ${sel}`);
    }

    const attrs: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr) {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
  }, selector);
}
