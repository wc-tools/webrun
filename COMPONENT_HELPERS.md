# Component Testing Helpers

Comprehensive utility functions for testing web components with Playwright.

## Installation

```typescript
import {
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
} from '@wc-tools/webrun';
```

## API Reference

### Property Management

#### `setProperty(page, selector, propertyName, value)`

Set a property on a web component with automatic type detection.

**Special Feature**: For function properties, automatically sets up tracking infrastructure in the browser context.

```typescript
// String property
await setProperty(page, 'my-component', 'message', 'Hello World');

// Object property
await setProperty(page, 'my-component', 'config', { theme: 'dark', size: 'large' });

// Array property
await setProperty(page, 'my-component', 'items', ['a', 'b', 'c']);

// Function property (automatically tracked)
await setProperty(page, 'my-component', 'onClick', () => {});
```

**Parameters:**
- `page: Page` - Playwright Page instance
- `selector: string` - CSS selector for the component
- `propertyName: string` - Name of the property to set
- `value: string | number | boolean | object | Function | null | undefined` - Value to set

---

#### `getProperty(page, selector, propertyName, options?)`

Get a property value from a web component with automatic retry mechanism.

**Automatic Retry Behavior:**
- Retries until the property is set (not `undefined`) or timeout is reached
- Similar to Playwright's built-in retry logic
- Useful for waiting for async property initialization

```typescript
// Basic usage - waits until property is defined
const count = await getProperty<number>(page, 'counter-component', 'count');
expect(count).toBe(5);

// With custom timeout and interval
const data = await getProperty<{name: string}>(page, 'data-component', 'data', {
  timeout: 10000,  // Wait up to 10 seconds
  interval: 200    // Check every 200ms
});
expect(data.name).toBe('Test');

// With predicate - wait for specific value
const status = await getProperty<{state: string}>(page, 'loader', 'status', {
  timeout: 5000,
  predicate: (value) => value.state === 'ready'
});
expect(status.state).toBe('ready');

// Wait for array to have items
const items = await getProperty<string[]>(page, 'list', 'items', {
  timeout: 3000,
  predicate: (value) => value.length > 0
});
expect(items.length).toBeGreaterThan(0);
```

**Parameters:**
- `page: Page` - Playwright Page instance
- `selector: string` - CSS selector for the component
- `propertyName: string` - Name of the property to get
- `options?: object` - Optional configuration
  - `timeout?: number` - Total timeout in milliseconds (default: 5000)
  - `interval?: number` - Retry interval in milliseconds (default: 100)
  - `predicate?: (value: T) => boolean` - Optional condition the value must satisfy

**Returns:** `Promise<T>` - The property value

**Throws:** Error if timeout is exceeded before property is set or predicate is satisfied

---

### Method Invocation

#### `call(page, selector, methodName, ...args)`

Call a method on a web component and get its return value.

```typescript
// Call method with arguments
const result = await call<number>(page, 'calculator', 'add', 10, 20);
expect(result).toBe(30);

// Call method without arguments
await call(page, 'my-component', 'reset');

// Call with complex arguments
await call(page, 'data-grid', 'updateRow', 5, { name: 'Updated', value: 100 });
```

**Parameters:**
- `page: Page` - Playwright Page instance
- `selector: string` - CSS selector for the component
- `methodName: string` - Name of the method to call
- `...args: unknown[]` - Arguments to pass to the method

**Returns:** `Promise<T>` - The method's return value

---

### Function Call Tracking

#### `getFunctionCalls(page, selector, propertyName)`

Get the call history for a function property that was set via `setProperty`.

```typescript
await setProperty(page, 'my-component', 'onClick', () => {});

// Trigger some clicks...
await page.click('#trigger-button');

// Get call history
const calls = await getFunctionCalls(page, 'my-component', 'onClick');
expect(calls).toHaveLength(1);
expect(calls[0]?.args?.[0]).toBe('clicked');
expect(calls[0]?.timestamp).toBeDefined();
```

**Returns:** `Promise<Array<{ timestamp: number; args: unknown[] }>>`

---

#### `clearFunctionCalls(page, selector, propertyName)`

Clear the call history for a tracked function property.

```typescript
await clearFunctionCalls(page, 'my-component', 'onClick');

const calls = await getFunctionCalls(page, 'my-component', 'onClick');
expect(calls).toHaveLength(0);
```

---

### Event Handling

#### `spyOn(page, selector, eventName)`

Spy on custom events emitted by a web component. Returns a getter function to retrieve captured events.

```typescript
// Start spying
const getEvents = await spyOn(page, 'my-component', 'custom-event');

// Trigger event...
await page.click('#trigger');

// Get captured events
const events = await getEvents();
expect(events).toHaveLength(1);
expect(events[0]?.type).toBe('custom-event');
expect(events[0]?.detail).toEqual({ value: 'test' });
expect(events[0]?.bubbles).toBe(true);
```

**Returns:** `Promise<() => Promise<CustomEvent[]>>` - Async getter function for events

---

#### `emit(page, selector, eventName, detail?, options?)`

Emit a custom event to a web component.

```typescript
// Simple event
await emit(page, 'my-component', 'refresh');

// Event with detail
await emit(page, 'my-component', 'data-changed', { id: 123, name: 'Test' });

// Event with options
await emit(page, 'my-component', 'notify', { message: 'Hello' }, {
  bubbles: true,
  cancelable: true,
  composed: true
});
```

**Parameters:**
- `page: Page` - Playwright Page instance
- `selector: string` - CSS selector for the component
- `eventName: string` - Name of the event to emit
- `detail?: unknown` - Event detail payload
- `options?: { bubbles?, cancelable?, composed? }` - Event options

---

#### `waitForEvent(page, selector, eventName, timeout?)`

Wait for a specific event to be emitted by a component.

```typescript
// Wait for event with default 5s timeout
const event = await waitForEvent(page, 'my-component', 'ready');
expect(event.type).toBe('ready');
expect(event.detail).toEqual({ status: 'initialized' });

// Wait with custom timeout
const event = await waitForEvent(page, 'my-component', 'loaded', 10000);
```

**Parameters:**
- `page: Page` - Playwright Page instance
- `selector: string` - CSS selector for the component
- `eventName: string` - Name of the event to wait for
- `timeout?: number` - Timeout in milliseconds (default: 5000)

**Returns:** `Promise<CustomEvent>` - The emitted event

---

### Component Lifecycle

#### `waitForComponent(page, componentName, timeout?)`

Wait for a custom element to be defined.

```typescript
await waitForComponent(page, 'my-component');
await waitForComponent(page, 'complex-element', 10000); // 10s timeout
```

**Parameters:**
- `page: Page` - Playwright Page instance
- `componentName: string` - Tag name of the custom element
- `timeout?: number` - Timeout in milliseconds (default: 5000)

---

#### `isComponentDefined(page, componentName)`

Check if a custom element is defined.

```typescript
const isDefined = await isComponentDefined(page, 'my-component');
if (isDefined) {
  // Component is ready
}
```

**Returns:** `Promise<boolean>`

---

### Attribute Helpers

#### `getAttributes(page, selector)`

Get all attributes from a web component as a key-value object.

```typescript
const attrs = await getAttributes(page, 'my-component');
expect(attrs).toEqual({
  'data-id': '123',
  'data-name': 'test',
  'class': 'active'
});
```

**Returns:** `Promise<Record<string, string>>`

---

## Locator-based Helpers

For when you're working with Playwright Locators instead of selectors.

### `setPropertyOnLocator(locator, propertyName, value)`

```typescript
const component = page.locator('my-component');
await setPropertyOnLocator(component, 'data', { value: 'test' });
```

### `callOnLocator(locator, methodName, ...args)`

```typescript
const component = page.locator('my-component');
const result = await callOnLocator<number>(component, 'calculate', 5, 10);
```

### `getPropertyFromLocator(locator, propertyName, options?)`

Same retry behavior as `getProperty` but works with Playwright Locators.

```typescript
const component = page.locator('my-component');

// Basic usage
const value = await getPropertyFromLocator<string>(component, 'message');

// With retry options
const data = await getPropertyFromLocator<object>(component, 'data', {
  timeout: 3000,
  predicate: (value) => Object.keys(value).length > 0
});
```

---

## Complete Example

```typescript
import { test, expect, setProperty, call, spyOn, emit, getFunctionCalls, waitForComponent } from '@wc-tools/webrun';

test('comprehensive component test', async ({ render, page }) => {
  await render(`
    <script type="module">
      class TestComponent extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<button id="btn">Click Me</button>';
          this.querySelector('#btn').addEventListener('click', () => {
            if (this.onClick) {
              this.onClick('clicked');
            }
            this.dispatchEvent(new CustomEvent('action', {
              detail: { type: 'click' }
            }));
          });
        }

        setValue(val) {
          this._value = val;
          return val * 2;
        }

        get value() {
          return this._value;
        }
      }
      customElements.define('test-component', TestComponent);
    </script>
    <test-component></test-component>
  `);

  // Wait for component
  await waitForComponent(page, 'test-component');

  // Set up function tracking
  await setProperty(page, 'test-component', 'onClick', () => {});

  // Set up event spy
  const getEvents = await spyOn(page, 'test-component', 'action');

  // Call method
  const result = await call<number>(page, 'test-component', 'setValue', 21);
  expect(result).toBe(42);

  // Get property
  const value = await getProperty<number>(page, 'test-component', 'value');
  expect(value).toBe(21);

  // Trigger click
  await page.click('#btn');
  await page.waitForTimeout(50);

  // Verify function was called
  const calls = await getFunctionCalls(page, 'test-component', 'onClick');
  expect(calls).toHaveLength(1);
  expect(calls[0]?.args?.[0]).toBe('clicked');

  // Verify event was emitted
  const events = await getEvents();
  expect(events).toHaveLength(1);
  expect(events[0]?.detail).toEqual({ type: 'click' });

  // Emit event to component
  await emit(page, 'test-component', 'external-action', { source: 'test' });
});
```

---

## Retry Mechanism

The `getProperty` and `getPropertyFromLocator` functions include Playwright-style automatic retry logic:

### Default Behavior

By default, these functions retry until the property is **not undefined**:

```typescript
// Waits up to 5 seconds for 'data' to be set
const data = await getProperty(page, 'my-component', 'data');
```

### Custom Timeout and Interval

Configure retry behavior:

```typescript
const value = await getProperty(page, 'my-component', 'value', {
  timeout: 10000,  // Wait up to 10 seconds
  interval: 200    // Check every 200ms (default: 100ms)
});
```

### Predicate-based Waiting

Wait for a specific condition:

```typescript
// Wait for count to reach 10
const count = await getProperty<number>(page, 'counter', 'count', {
  predicate: (value) => value >= 10
});

// Wait for array to have items
const items = await getProperty<string[]>(page, 'list', 'items', {
  predicate: (arr) => arr.length > 0
});

// Wait for specific object state
const status = await getProperty<{ready: boolean}>(page, 'loader', 'status', {
  predicate: (s) => s.ready === true
});
```

### Use Cases

**1. Async Property Initialization**
```typescript
// Component sets property after async operation
await setProperty(page, 'component', 'data', someValue);
const result = await getProperty(page, 'component', 'processedData', {
  timeout: 3000  // Wait for async processing
});
```

**2. Polling for State Changes**
```typescript
// Wait for loading to complete
const isLoaded = await getProperty<boolean>(page, 'app', 'isLoaded', {
  predicate: (val) => val === true,
  timeout: 10000
});
```

**3. Event-driven Updates**
```typescript
// Trigger action and wait for result
await page.click('#trigger');
const result = await getProperty<string>(page, 'component', 'result', {
  timeout: 2000
});
```

### Error Handling

When timeout is exceeded, a descriptive error is thrown:

```typescript
// Without predicate
// Error: Timeout 5000ms exceeded waiting for property "data" on "my-component"
// to be defined. Current value: undefined

// With predicate
// Error: Timeout 5000ms exceeded waiting for property "count" on "counter"
// to satisfy predicate. Current value: 5
```

---

## Implementation Notes

### Automatic Function Tracking

When you use `setProperty` with a function value:

1. A global tracking object is created in the browser: `window.__componentHelpers`
2. The function is wrapped to capture all calls with timestamps and arguments
3. Each call is stored in `window.__componentHelpers.functionCalls[callId]`
4. You can retrieve calls via `getFunctionCalls()`

This happens automatically - you don't need to do anything special.

### Event Spy Implementation

`spyOn` works by:

1. Adding an event listener to the component
2. Storing each event in `window.__componentHelpers.events[eventId]`
3. Returning a getter function that retrieves the stored events

The returned getter function can be called multiple times to check for new events.

### Type Safety

All helpers support TypeScript generics for type-safe return values:

```typescript
const count = await getProperty<number>(page, 'counter', 'count');
const result = await call<string>(page, 'formatter', 'format', data);
const value = await getPropertyFromLocator<boolean>(locator, 'isActive');
```

---

## Browser Compatibility

All helpers work across Chromium, Firefox, and WebKit (tested in Playwright).

## Performance Considerations

- Function tracking adds minimal overhead (just storing call metadata)
- Event spying stores event data in memory - clear old spies if running many tests
- `waitForEvent` uses Playwright's evaluation context, so it's efficient
