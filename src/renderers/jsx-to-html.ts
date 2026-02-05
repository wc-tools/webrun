/**
 * JSX to HTML Converter using Stencil
 * Converts JSX objects to HTML strings using Stencil's h() and serializeNodeToHtml
 */

import { h as stencilH } from '@stencil/core/internal';
import type { VNode } from '@stencil/core/internal';
import { createDocument, serializeNodeToHtml } from '@stencil/core/mock-doc';

/**
 * Convert JSX object to HTML string using Stencil
 */
export function jsxToHTML(jsx: Record<string, unknown>): string {
  // Convert JSX to Stencil VNode
  const vnode = jsxToVNode(jsx);

  // Create a mock document to render the VNode
  const doc = createDocument();

  // Render VNode to mock DOM element
  const element = vnodeToElement(vnode, doc);

  // Serialize the element to HTML string
  return serializeNodeToHtml(element, {
    prettyHtml: false,
    outerHtml: true,
    serializeShadowRoot: false
  });
}

/**
 * Convert JSX format to Stencil VNode using h()
 */
function jsxToVNode(jsx: Record<string, unknown>): VNode {
  const type = jsx['type'] as string;
  const props = (jsx['props'] as Record<string, unknown>) || {};
  const { children, ...attrs } = props;

  // Convert className → class, htmlFor → for (React/JSX conventions)
  const stencilAttrs: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) {
      continue;
    }

    if (key === 'className') {
      stencilAttrs['class'] = value;
    } else if (key === 'htmlFor') {
      stencilAttrs['for'] = value;
    } else {
      stencilAttrs[key] = value;
    }
  }

  // Process children recursively
  const vnodeChildren = processChildren(children);

  // Use Stencil's h() function to create VNode
  if (vnodeChildren.length === 0) {
    return stencilH(type, stencilAttrs);
  } else if (vnodeChildren.length === 1 && typeof vnodeChildren[0] === 'string') {
    return stencilH(type, stencilAttrs, vnodeChildren[0]);
  } else {
    return stencilH(type, stencilAttrs, vnodeChildren as VNode[]);
  }
}

/**
 * Process children recursively
 */
function processChildren(children: unknown): (VNode | string)[] {
  if (children === null || children === undefined || children === false) {
    return [];
  }

  if (Array.isArray(children)) {
    return children.flatMap(child => processChildren(child));
  }

  if (typeof children === 'object') {
    const obj = children as Record<string, unknown>;
    if (obj['__pw_type'] === 'jsx') {
      return [jsxToVNode(obj)];
    }
  }

  // String, number, boolean → convert to string
  return [String(children)];
}

/**
 * Convert VNode to actual DOM element using mock document
 */
function vnodeToElement(vnode: VNode, doc: Document): Element | Text {
  // Handle text nodes (when $tag$ is null and $text$ exists)
  if (vnode.$tag$ === null && vnode.$text$ !== null && vnode.$text$ !== undefined) {
    return doc.createTextNode(vnode.$text$);
  }

  // Handle element nodes
  const tag = vnode.$tag$ as string;
  const element = doc.createElement(tag);

  // Set attributes
  if (vnode.$attrs$) {
    for (const [key, value] of Object.entries(vnode.$attrs$)) {
      if (value === true) {
        element.setAttribute(key, '');
      } else if (value !== false && value !== null && value !== undefined) {
        element.setAttribute(key, String(value));
      }
    }
  }

  // Append children
  if (vnode.$children$) {
    for (const child of vnode.$children$) {
      if (child) {
        const childElement = vnodeToElement(child, doc);
        element.appendChild(childElement);
      }
    }
  }

  return element;
}

/**
 * Check if value is a JSX element
 * Note: Playwright transforms .tsx files to { __pw_type: 'jsx', type: '...', props: {...} }
 */
export function isJSX(val: unknown): boolean {
  return typeof val === 'object' &&
         val !== null &&
         (val as Record<string, unknown>)['__pw_type'] === 'jsx';
}
