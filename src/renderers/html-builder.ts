/**
 * HTML Page Builder
 * Builds complete HTML documents with context (styles, scripts, import maps)
 */

import type { RenderContext } from './types.js';

/**
 * Build full HTML page from component HTML
 */
export function buildHTML(componentHTML: string, context: RenderContext): string {
  const importMapTag = context.importMap
    ? `<script type="importmap">${JSON.stringify(context.importMap, null, 2)}</script>\n            `
    : '';

  const stylesheetLinks = context.stylesheets
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n            ');

  const scriptTags = context.scripts
    .map((src) => `<script src="${src}"></script>`)
    .join('\n            ');

  return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${importMapTag}${stylesheetLinks}
            ${context.globalStyles ? `<style>${context.globalStyles}</style>` : ''}
          </head>
          <body>
            <div id="test-container">${componentHTML}</div>
            ${scriptTags}
          </body>
        </html>
      `;
}
