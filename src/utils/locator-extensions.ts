/**
 * Locator extensions for component testing
 * Adds helper methods to Playwright's Locator interface
 */

import type { Locator } from '@playwright/test';
import { getPropertyFromLocator } from '../helpers/property.js';
import { setPropertyOnLocator } from '../helpers/property.js';
import { callOnLocator } from '../helpers/methods.js';

import type { PropertyValue } from '../helpers/types.js';

/**
 * Extended Locator interface with component testing helpers
 */
export interface ExtendedLocator extends Locator {
  /**
   * Get a property value from the element with automatic retry
   * @param propertyName - Name of the property to get
   * @param options - Retry options
   */
  getProperty<T = unknown>(
    propertyName: string,
    options?: {
      timeout?: number;
      interval?: number;
      predicate?: (value: T) => boolean;
    }
  ): Promise<T>;

  /**
   * Set a property on the element
   * @param propertyName - Name of the property to set
   * @param value - Value to set
   */
  setProperty(propertyName: string, value: PropertyValue): Promise<void>;

  /**
   * Call a method on the element
   * @param methodName - Name of the method to call
   * @param args - Arguments to pass to the method
   */
  callMethod<T = unknown>(methodName: string, ...args: unknown[]): Promise<T>;
}

/**
 * Extend a Playwright Locator with helper methods
 * @param locator - The Playwright locator to extend
 * @returns An extended locator with helper methods
 */
export function extendLocator(locator: Locator): ExtendedLocator {
  const extended = Object.create(Object.getPrototypeOf(locator));

  // Copy all properties and methods from the original locator
  Object.setPrototypeOf(extended, Object.getPrototypeOf(locator));
  Object.assign(extended, locator);

  // Add new methods
  extended.getProperty = async function <T = unknown>(
    propertyName: string,
    options?: {
      timeout?: number;
      interval?: number;
      predicate?: (value: T) => boolean;
    }
  ): Promise<T> {
    return await getPropertyFromLocator<T>(locator, propertyName, options);
  };

  extended.setProperty = async function (propertyName: string, value: PropertyValue): Promise<void> {
    return await setPropertyOnLocator(locator, propertyName, value);
  };

  extended.callMethod = async function <T = unknown>(methodName: string, ...args: unknown[]): Promise<T> {
    return await callOnLocator<T>(locator, methodName, ...args);
  };

  return extended as ExtendedLocator;
}
