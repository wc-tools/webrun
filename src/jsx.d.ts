/**
 * Minimal JSX type definitions
 * Playwright handles the actual JSX transform
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }

    type Element = unknown;

    interface ElementChildrenAttribute {
      children: unknown;
    }
  }
}

export {};
