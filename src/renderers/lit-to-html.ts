/**
 * Lit to HTML Converter
 * Server-side rendering for Lit templates
 */

import { render as litRender } from '@lit-labs/ssr';
import { collectResultSync } from '@lit-labs/ssr/lib/render-result.js';

/**
 * Render Lit template to HTML string using SSR
 */
export function litToHTML(template: unknown): string {
  const litResult = litRender(template);
  return collectResultSync(litResult);
}

/**
 * Check if value is a Lit template
 */
export function isLit(val: unknown): boolean {
  return typeof val === 'object' &&
         val !== null &&
         ('_$litType$' in val || 'strings' in val);
}
