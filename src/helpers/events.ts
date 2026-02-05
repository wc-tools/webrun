/**
 * Event handling helpers for web components
 */

import type { Page, Locator } from '@playwright/test';
import type { TrackedEvent } from './types.js';

/**
 * Spy on events emitted by a web component using a Locator
 * Returns a function to get the captured events
 */
export async function spyOn(
  locator: Locator,
  eventName: string
): Promise<() => Promise<TrackedEvent[]>>;

/**
 * Spy on events emitted by a web component using Page and selector
 * Returns a function to get the captured events
 */
export async function spyOn(
  page: Page,
  selector: string,
  eventName: string
): Promise<() => Promise<TrackedEvent[]>>;

/**
 * Implementation
 */
export async function spyOn(
  pageOrLocator: Page | Locator,
  selectorOrEventName: string,
  maybeEventName?: string
): Promise<() => Promise<TrackedEvent[]>> {
  // Determine if first arg is a Locator or Page
  const isLocator = 'evaluate' in pageOrLocator && 'page' in pageOrLocator;

  const page = isLocator ? (pageOrLocator as Locator).page() : (pageOrLocator as Page);
  const eventName = isLocator ? selectorOrEventName : maybeEventName!;

  // For locator, we need to get a unique selector
  let selector: string;
  if (isLocator) {
    // Generate a unique event ID for this locator
    const locatorId = `locator-${Math.random().toString(36).substring(2, 11)}`;

    // Attach a data attribute to the element for tracking
    await (pageOrLocator as Locator).evaluate((el, id) => {
      el.setAttribute('data-spy-id', id);
    }, locatorId);

    selector = `[data-spy-id="${locatorId}"]`;
  } else {
    selector = selectorOrEventName;
  }
  await page.evaluate(
    ({ sel, event }) => {
      const element = document.querySelector(sel);
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }

      // Initialize tracking storage
      if (!window.__componentHelpers) {
        window.__componentHelpers = {};
      }
      if (!window.__componentHelpers.events) {
        window.__componentHelpers.events = {};
      }

      const eventId = `${sel}:${event}`;
      window.__componentHelpers.events[eventId] = [];

      // Add event listener that captures events
      element.addEventListener(event, ((e: CustomEvent) => {
        if (window.__componentHelpers?.events?.[eventId]) {
          window.__componentHelpers.events[eventId].push({
            type: e.type,
            detail: e.detail,
            timestamp: Date.now(),
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            composed: e.composed
          });
        }
      }) as EventListener);
    },
    { sel: selector, event: eventName }
  );

  // Return getter function
  return async () => {
    return await page.evaluate(
      ({ sel, event }) => {
        const eventId = `${sel}:${event}`;
        return window.__componentHelpers?.events?.[eventId] ?? [];
      },
      { sel: selector, event: eventName }
    ) as TrackedEvent[];
  };
}

/**
 * Emit a custom event on a web component
 */
export async function emit(
  page: Page,
  selector: string,
  eventName: string,
  detail?: unknown,
  options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): Promise<void> {
  await page.evaluate(
    ({ sel, event, eventDetail, eventOptions }) => {
      const element = document.querySelector(sel);
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }

      const customEvent = new CustomEvent(event, {
        detail: eventDetail,
        bubbles: eventOptions?.bubbles ?? true,
        cancelable: eventOptions?.cancelable ?? true,
        composed: eventOptions?.composed ?? true
      });

      element.dispatchEvent(customEvent);
    },
    {
      sel: selector,
      event: eventName,
      eventDetail: detail,
      eventOptions: options
    }
  );
}

/**
 * Wait for an event to be emitted
 */
export async function waitForEvent(
  page: Page,
  selector: string,
  eventName: string,
  timeout = 5000
): Promise<TrackedEvent> {
  return await page.evaluate(
    ({ sel, event, timeoutMs }) => {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(sel);
        if (!element) {
          reject(new Error(`Element not found: ${sel}`));
          return;
        }

        const timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for event: ${event}`));
        }, timeoutMs);

        const handler = (e: Event) => {
          cleanup();
          const customEvent = e as CustomEvent;
          resolve({
            type: customEvent.type,
            detail: customEvent.detail,
            timestamp: Date.now(),
            bubbles: customEvent.bubbles,
            cancelable: customEvent.cancelable,
            composed: customEvent.composed
          });
        };

        const cleanup = () => {
          clearTimeout(timeoutId);
          element.removeEventListener(event, handler);
        };

        element.addEventListener(event, handler, { once: true });
      });
    },
    { sel: selector, event: eventName, timeoutMs: timeout }
  );
}
