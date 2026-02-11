/**
 * Component Testing Runtime for Playwright
 *
 * A library that extends Playwright's test base with component rendering capabilities
 * for testing web components and HTML elements.
 */

export { test, expect } from './runtime.js';
export type {
  RenderResult,
  ComponentTestFixtures,
  ComponentTestingConfig,
  RenderOptions,
} from './runtime.js';

export { extendLocator } from './utils/locator-extensions.js';
export type { ExtendedLocator } from './utils/locator-extensions.js';

export { expectWithScreenshots, setPageContext, setAutoVrtEnabled } from './utils/expect-extensions.js';

export { withComponentTesting, getBaseURL } from './preset.js';
export type { ComponentTestingPresetOptions } from './preset.js';

export {
  setProperty,
  call,
  getProperty,
  spyOn,
  emit,
  getFunctionCalls,
  clearFunctionCalls,
  waitForComponent,
  waitForEvent,
  getAttributes,
  isComponentDefined,
  setPropertyOnLocator,
  callOnLocator,
  getPropertyFromLocator
} from './helpers/index.js';

// Re-export locator extensions for TypeScript
export type {} from './utils/locator-extensions.js';
