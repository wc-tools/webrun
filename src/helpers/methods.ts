/**
 * Method invocation helpers for web components
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Call a method on a web component
 */
export async function call<T = unknown>(
  page: Page,
  selector: string,
  methodName: string,
  ...args: unknown[]
): Promise<T> {
  return await page.evaluate(
    ({ sel, method, methodArgs }) => {
      const element = document.querySelector(sel) as HTMLElement & Record<string, Function>;
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }
      if (typeof element[method] !== 'function') {
        throw new Error(`Method ${method} not found on element`);
      }
      return element[method](...methodArgs);
    },
    { sel: selector, method: methodName, methodArgs: args }
  );
}

/**
 * Call method using a Locator
 */
export async function callOnLocator<T = unknown>(
  locator: Locator,
  methodName: string,
  ...args: unknown[]
): Promise<T> {
  return await locator.evaluate(
    (element, { method, methodArgs }) => {
      const el = element as HTMLElement & Record<string, Function>;
      const fn = el[method];
      if (typeof fn !== 'function') {
        throw new Error(`Method ${method} not found on element`);
      }
      return fn(...methodArgs);
    },
    { method: methodName, methodArgs: args }
  );
}
