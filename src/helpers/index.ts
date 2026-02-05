/**
 * Component Testing Helpers
 * Utilities for testing web components with Playwright
 */

// Property management
export {
  setProperty,
  getProperty,
  setPropertyOnLocator,
  getPropertyFromLocator,
  getFunctionCalls,
  clearFunctionCalls,
  getAttributes
} from './property.js';

// Method invocation
export {
  call,
  callOnLocator
} from './methods.js';

// Event handling
export {
  spyOn,
  emit,
  waitForEvent
} from './events.js';

// Component lifecycle
export {
  waitForComponent,
  isComponentDefined
} from './lifecycle.js';

// Types
export type {
  PropertyValue,
  PropertyDescriptor,
  TrackedEvent,
  FunctionCall
} from './types.js';
