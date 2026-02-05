# Component Testing Helpers

Organized collection of utility functions for testing web components with Playwright.

## File Structure

```
src/helpers/
├── index.ts          # Main export file - exports all helpers
├── types.ts          # TypeScript type definitions
├── retry.ts          # Retry logic for async operations
├── utils.ts          # Utility functions (type detection, etc.)
├── property.ts       # Property get/set operations
├── methods.ts        # Method invocation helpers
├── events.ts         # Event handling (spy, emit, wait)
└── lifecycle.ts      # Component lifecycle helpers
```

## Modules

### `types.ts`
Core type definitions used across all helpers:
- `PropertyValue` - Union type for all valid property values
- `PropertyDescriptor` - Property metadata with type information
- `TrackedEvent` - Custom event tracking structure
- `FunctionCall` - Function call tracking structure
- Global `Window` interface extensions

### `retry.ts`
Generic retry helper that wraps async functions with configurable retry logic:
- `retry<T>()` - Wraps any async function with retry behavior
  - Configurable timeout
  - Custom wait function between retries
  - Descriptive error messages

### `utils.ts`
Utility functions:
- `detectPropertyType()` - Determines the type of a property value

### `property.ts`
Property management for web components:
- `setProperty()` - Set properties with automatic type detection
- `getProperty()` - Get properties with retry logic
- `setPropertyOnLocator()` - Set properties using Playwright Locators
- `getPropertyFromLocator()` - Get properties using Locators with retry
- `getFunctionCalls()` - Retrieve function call history
- `clearFunctionCalls()` - Clear function call tracking
- `getAttributes()` - Get all attributes from an element

**Features:**
- Automatic function tracking when setting function properties
- Retry logic with predicates for async property updates
- Type-safe with TypeScript generics

### `methods.ts`
Method invocation helpers:
- `call()` - Call methods on web components
- `callOnLocator()` - Call methods using Playwright Locators

### `events.ts`
Event handling utilities:
- `spyOn()` - Spy on custom events with automatic capturing
- `emit()` - Dispatch custom events to components
- `waitForEvent()` - Wait for a specific event to be emitted

**Features:**
- Automatic event tracking in browser context
- Returns getter functions for captured events
- Configurable event options (bubbles, cancelable, composed)

### `lifecycle.ts`
Component lifecycle helpers:
- `waitForComponent()` - Wait for custom element to be defined
- `isComponentDefined()` - Check if custom element is defined

## Design Principles

1. **Single Responsibility** - Each file has one clear purpose
2. **Type Safety** - Full TypeScript support with strict mode
3. **No Side Effects** - Pure functions where possible
4. **Browser Context Isolation** - Tracking happens in browser, not Node.js
5. **Automatic Cleanup** - Tracking structures initialized automatically
6. **Retry by Default** - `getProperty` includes retry logic for async scenarios

## TypeScript Errors

The test files may show TypeScript errors for dynamic window properties (e.g., `window.callbackResults`). These are expected - the test files define these properties dynamically in the browser context during test execution.

## Usage

All helpers are re-exported from `index.ts`:

```typescript
import {
  setProperty,
  getProperty,
  call,
  spyOn,
  emit,
  waitForComponent
} from './helpers/index.js';
```

Or import from the main package:

```typescript
import {
  setProperty,
  getProperty,
  call,
  spyOn
} from '@wc-tools/webrun';
```
