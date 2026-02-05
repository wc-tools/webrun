/**
 * Renderer Registry - Functional Pattern
 * Simple plugin-based renderer with automatic type detection
 */

import type { RenderContext, RendererResult } from './types.js';
import { isLit, litToHTML } from './lit-to-html.js';
import { isJSX, jsxToHTML } from './jsx-to-html.js';
import { buildHTML } from './html-builder.js';

/**
 * Registry of render plugins
 * Order matters: most specific first
 */
const RENDER_PLUGINS = [
  {
    test: (val: unknown) => isLit(val),
    exec: async (val: unknown) => litToHTML(val)
  },
  {
    test: (val: unknown) => isJSX(val),
    exec: async (val: unknown) => jsxToHTML(val as Record<string, unknown>)
  },
  {
    test: (val: unknown) => typeof val === 'string',
    exec: async (val: unknown) => String(val)
  }
];

/**
 * The orchestrator - finds and executes the right plugin
 */
export async function render(input: unknown, context: RenderContext): Promise<RendererResult> {
  const plugin = RENDER_PLUGINS.find(p => p.test(input));

  if (!plugin) {
    throw new Error(`No renderer found for input type: ${typeof input}`);
  }

  const componentHTML = await plugin.exec(input);
  const html = buildHTML(componentHTML, context);

  return { html };
}
