/**
 * Utility functions for component helpers
 */

import type { PropertyValue, PropertyDescriptor } from './types.js';

/**
 * Detect the type of a property value
 */
export function detectPropertyType(value: PropertyValue): PropertyDescriptor {
  if (value === null) {
    return { type: 'null', value };
  }
  if (value === undefined) {
    return { type: 'undefined', value };
  }
  if (typeof value === 'function') {
    return { type: 'function', value };
  }
  if (typeof value === 'string') {
    return { type: 'string', value };
  }
  if (typeof value === 'number') {
    return { type: 'number', value };
  }
  if (typeof value === 'boolean') {
    return { type: 'boolean', value };
  }
  if (Array.isArray(value)) {
    return { type: 'array', value };
  }
  return { type: 'object', value };
}
