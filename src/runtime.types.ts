/**
 * Runtime Types
 * Type definitions for the component testing runtime
 */

import type { ExtendedLocator } from './utils/locator-extensions.js';
import type { Expect } from '@playwright/test';

/**
 * Minimal JSX type (Playwright handles JSX transform)
 */
export type JSXElement = unknown;

/**
 * Support for Lit templates (optional - won't break if lit is not installed)
 */
export type LitTemplateResult = unknown;

/**
 * Component testing configuration
 */
export interface ComponentTestingConfig {
  stylesheets?: string[];
  scripts?: string[];
  globalStyles?: string;
  importMap?: {
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
  };
  autoVrt?: boolean;
  initialWaitForElement?: string;
}

/**
 * Options for the render function
 */
export interface RenderOptions {
  /**
   * Skip the automatic visibility check
   * When true, waits for element to be attached instead of visible
   * Useful for testing hidden or display:none elements
   */
  skipVisibilityCheck?: boolean;
}

/**
 * Result from rendering a component
 */
export interface RenderResult {
  /**
   * The container locator that holds the rendered component (first child)
   * Extended with helper methods: getProperty, setProperty, callMethod
   */
  container: ExtendedLocator;

  /**
   * Unmount the rendered component
   */
  unmount: () => Promise<void>;
}

/**
 * Extended Playwright test fixtures with component testing capabilities
 */
export interface ComponentTestFixtures {
  /**
   * Render a web component or HTML element for testing
   * @param component - HTML string, JSX element, or Lit template to render
   * @param options - Optional render options
   */
  render: (component: string | JSXElement | LitTemplateResult, options?: RenderOptions) => Promise<RenderResult>;

  /**
   * Extended expect that automatically captures screenshots when autoVrt is enabled
   * When autoVrt is false, this is the standard Playwright expect
   */
  expect: Expect;
}
