/**
 * Types for the renderer system
 */

export interface RenderContext {
  /**
   * Global stylesheets to include
   */
  stylesheets: string[];

  /**
   * Global scripts to include
   */
  scripts: string[];

  /**
   * Inline global styles
   */
  globalStyles: string;

  /**
   * Import map for ES modules
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
   */
  importMap?: {
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
  };
}

export interface RendererResult {
  /**
   * The rendered HTML string
   */
  html: string;
}
