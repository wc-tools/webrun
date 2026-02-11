# Component Testing Runtime for Playwright

A modern, type-safe testing runtime for web components with Playwright. Test your components in real browsers using a familiar Testing Library-like API, with full support for JSX, Lit, Stencil, and vanilla Custom Elements.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.58-green.svg)](https://playwright.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## Key Features

- **Familiar Testing Library-like test syntax** - Write component tests with the `render(<component attribute={value} />)` API you already know
- **Automatic visual regression testing** - Capture screenshots after every assertion with `autoVrt` mode for zero-config and zero-code visual testing
- **Built-in helpers with auto retry** - `getProperty()`, `setProperty()`, `callMethod()`, and other helpers automatically retry until successful. Set properties/functions, emit events, spy on handlers
- **Support for JSX and Lit HTML components** - Write tests in your preferred format
- **VSCode Test Explorer integration** - Run and debug tests directly in VSCode with the Playwright extension (zero configuration) and using the  official `ms-playwright.playwright` extension
- **Hot reload and Tooling** - Watch mode for rapid test iteration
- **Automatic component type detection** - JSX and Lit HTML detected automatically
- **Works with any web component library** - Stencil, Lit, vanilla Custom Elements, etc.
- **Example projects for Lit and Stencil** - Get started quickly with working examples
- **Easy configurable testbeds** - Import maps, custom styles, and startup scripts
- **Automatic visibility detection** - Components are automatically ready when you need them

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Common Use Cases](#common-use-cases)
  - [Testing Forms](#testing-forms)
  - [Testing Event Handlers](#testing-event-handlers)
  - [Testing Accessibility](#testing-accessibility)
  - [Testing Async Operations](#testing-async-operations)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Advanced Topics](#advanced-topics)
  - [VSCode Extension Integration](#vscode-extension-integration)
  - [Automatic Visual Regression Testing](#automatic-visual-regression-testing)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)
- [Contributing](#contributing)

## Installation

```bash
# Using pnpm (recommended)
pnpm add -D webrun-testing @playwright/test

# Using npm
npm install --save-dev webrun-testing @playwright/test

# Using yarn
yarn add -D webrun-testing @playwright/test
```

## Quick Start

### Step 1: Configure Playwright

Create or update `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import { withComponentTesting } from 'webrun-testing';

export default withComponentTesting({
  port: 3000,
  host: 'localhost',
  autoStart: true, // Auto-start http-server
})(defineConfig({
  testDir: './test',
  fullyParallel: true,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
}));
```

### Step 2: Configure TypeScript (for JSX)

If using JSX, update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "webrun-testing",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

### Step 3: Write Your First Test

Create `test/button.spec.tsx`:

```typescript
import { test, expect, spyOn } from 'webrun-testing';

test('button handles clicks', async ({ render }) => {
  // Render component
  const { container } = await render(
    <button id="my-button">Click me</button>
  );

  // Spy on click events
  const getClickEvents = await container.spyOn('click');

  // Interact with component
  await container.click();
  await container.click();

  // Assert behavior
  const events = await getClickEvents();
  expect(events).toHaveLength(2);
});
```

### Step 4: Run Tests

```bash
npx playwright test
```

## Core Concepts

### The `render()` Fixture

The `render()` function is the primary way to render components in tests. It accepts HTML strings, JSX, or Lit templates:

```typescript
// JSX
const { container } = await render(<my-component value="test" />);

// Lit
const { container } = await render(html`<my-component value="test"></my-component>`);

// HTML string
const { container } = await render('<my-component value="test"></my-component>');
```

### Understanding `container`

The `container` is a Playwright Locator that points to your rendered component's root element. It extends Playwright's Locator with web component-specific methods:

```typescript
const { container } = await render(<my-component />);

// ✅ All standard Playwright Locator methods
await container.click();
await expect(container).toBeVisible();
const button = container.getByRole('button');

// ✅ Plus web component helpers
await container.setProperty('value', 'test');
const value = await container.getProperty<string>('value');
await container.callMethod('reset');
```

**Key Points:**
- `container` represents the **first child** of the render container (your component's root)
- Use `container` methods for the rendered component
- Use `container.locator()` or `container.getByRole()` for child elements

### Automatic Retry with `getProperty()`

The `getProperty()` method automatically retries until a property is set, perfect for async component initialization:

```typescript
test('waits for async properties', async ({ render }) => {
  const { container } = await render(<my-async-component />);

  // Automatically retries for up to 5 seconds
  const data = await container.getProperty<string>('loadedData');

  expect(data).toBe('loaded');
});
```

### Component Lifecycle

The `render()` function returns an `unmount()` helper for cleanup:

```typescript
test('unmounts component', async ({ render }) => {
  const { container, unmount } = await render(<my-component />);

  await expect(container).toBeVisible();

  // Clean up
  await unmount();

  await expect(container).not.toBeVisible();
});
```

## Common Use Cases

### Testing Forms

```typescript
import { test, expect, spyOn } from 'webrun-testing';

test('handles form submission', async ({ render }) => {
  const { container } = await render(
    <form>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" />

      <label htmlFor="password">Password</label>
      <input type="password" id="password" name="password" />

      <button type="submit">Login</button>
    </form>
  );

  // Spy on submit events
  const getSubmitEvents = await container.spyOn('submit');

  // Fill form using accessible queries
  await container.getByLabel('Email').fill('user@example.com');
  await container.getByLabel('Password').fill('secret123');
  await container.getByRole('button', { name: 'Login' }).click();

  // Verify submission
  const events = await getSubmitEvents();
  expect(events).toHaveLength(1);
});
```

### Testing Event Handlers

```typescript
import { test, expect, spyOn } from 'webrun-testing';

test('tracks button clicks', async ({ render }) => {
  const { container } = await render(
    <button id="counter">Click count: 0</button>
  );

  // Set up event spy
  const getClickEvents = await container.spyOn('click');

  // Trigger multiple clicks
  await container.click();
  await container.click();
  await container.click();

  // Verify all clicks were captured
  const events = await getClickEvents();
  expect(events).toHaveLength(3);
  expect(events[0]?.type).toBe('click');
});
```

### Testing Accessibility

```typescript
import { test, expect } from 'webrun-testing';

test('has proper ARIA attributes', async ({ render }) => {
  const { container } = await render(
    <button
      aria-label="Open menu"
      aria-expanded="false"
      aria-controls="main-menu"
    >
      Menu
    </button>
  );

  // Verify ARIA attributes
  await expect(container).toHaveAttribute('aria-label', 'Open menu');
  await expect(container).toHaveAttribute('aria-expanded', 'false');
  await expect(container).toHaveAttribute('aria-controls', 'main-menu');

  // Verify accessible name
  await expect(container).toHaveAccessibleName('Open menu');
});
```

### Testing Async Operations

```typescript
import { test, expect } from 'webrun-testing';

test('handles async data loading', async ({ render }) => {
  const { container } = await render(
    <data-loader id="loader" />
  );

  // Initial state
  await expect(container).toHaveText('Loading...');

  // Wait for async property with custom predicate
  const data = await container.getProperty<{ loaded: boolean }>('dataset', {
    predicate: (data) => data?.loaded === true,
    timeout: 5000
  });

  expect(data.loaded).toBe(true);
  await expect(container).toHaveText('Loaded!');
});
```

### Testing Custom Web Components

```typescript
import { test, expect, waitForComponent } from 'webrun-testing';

test('tests custom element with Shadow DOM', async ({ render, page }) => {
  const { container } = await render(
    <my-custom-button variant="primary">
      Click Me
    </my-custom-button>
  );

  // Wait for custom element to be defined
  await waitForComponent(page, 'my-custom-button');

  // Set component properties
  await container.setProperty('disabled', true);

  // Call component methods
  const result = await container.callMethod<string>('getText');
  expect(result).toBe('Click Me');

  // Access Shadow DOM elements
  const shadowButton = container.locator('button');
  await expect(shadowButton).toBeDisabled();
});
```

## Configuration

### Configuration Options Reference

The `withComponentTesting()` function accepts these options:

```typescript
interface ComponentTestingPresetOptions {
  /** Port for the dev server (default: 3000) */
  port?: number;

  /** Host for the dev server (default: 'localhost') */
  host?: string;

  /** Static files directory (default: './public')
   *
   * Examples:
   * - Stencil: './dist' (contains loader + ESM components)
   * - Lit: './dist' (contains built components)
   * - Vanilla: './public' (static assets)
   */
  staticDir?: string;

  /** Auto-start web server (default: true) */
  autoStart?: boolean;

  /** Additional http-server CLI options */
  serverOptions?: string;

  /** Global CSS files to include in test pages */
  stylesheets?: string[];

  /** Global JavaScript files to include
   *
   * Examples:
   * - Stencil: ['/build/my-library.esm.js']
   * - Lit: ['/my-components.js']
   */
  scripts?: string[];

  /** Inline global styles */
  globalStyles?: string;

  /** ES module import map for CDN dependencies */
  importMap?: {
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
  };

  /** Enable automatic visual regression testing (default: false)
   * Captures screenshots after every assertion for visual testing
   */
  autoVrt?: boolean;

  /** Custom web server configuration
   * Overrides the default http-server settings
   */
  webServer?: Partial<PlaywrightTestConfig['webServer']>;
}
```

### Framework-Specific Configuration

#### Stencil Components

```typescript
import { defineConfig } from '@playwright/test';
import { withComponentTesting } from 'webrun-testing';

export default withComponentTesting({
  port: 3000,
  staticDir: './dist', // Stencil build output
  scripts: [
    '/build/my-component-library.esm.js' // Stencil loader
  ],
  autoStart: true
})(defineConfig({
  testDir: './test',
  fullyParallel: true,
}));
```

See [examples/playwright.config.stencil.ts](./examples/playwright.config.stencil.ts) for complete example.

#### Lit Components

```typescript
import { defineConfig } from '@playwright/test';
import { withComponentTesting } from 'webrun-testing';

export default withComponentTesting({
  port: 3000,
  staticDir: './dist',
  scripts: ['/my-components.js'],
  importMap: {
    imports: {
      'lit': 'https://cdn.jsdelivr.net/npm/lit@3/+esm',
      'lit/': 'https://cdn.jsdelivr.net/npm/lit@3/',
      '@lit/reactive-element': 'https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/+esm',
    }
  }
})(defineConfig({
  testDir: './test',
  fullyParallel: true,
}));
```

See [examples/playwright.config.lit.ts](./examples/playwright.config.lit.ts) for complete example.

#### Vanilla Custom Elements

```typescript
export default withComponentTesting({
  port: 3000,
  staticDir: './public',
  scripts: ['/components.js'],
  stylesheets: ['/styles/components.css']
})(defineConfig({
  testDir: './test',
}));
```

### Global Styles and Scripts

Add global CSS and JavaScript to all test pages:

```typescript
export default withComponentTesting({
  stylesheets: [
    '/styles/reset.css',
    '/styles/theme.css',
  ],
  scripts: [
    '/scripts/polyfills.js',
  ],
  globalStyles: `
    * {
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 0;
    }
  `,
})(defineConfig({ /* ... */ }));
```

### Import Maps for ES Modules

Use import maps to load libraries from CDNs without bundling:

```typescript
export default withComponentTesting({
  importMap: {
    imports: {
      'lit': 'https://cdn.jsdelivr.net/npm/lit@3/+esm',
      'lit/': 'https://cdn.jsdelivr.net/npm/lit@3/',
      'react': 'https://esm.sh/react@18',
      'react-dom': 'https://esm.sh/react-dom@18',
    },
  },
})(defineConfig({ /* ... */ }));
```

Then use in your tests:

```typescript
import { html } from 'lit';

test('uses import map', async ({ render }) => {
  const { container } = await render(html`
    <div>
      <h1>Hello from Lit!</h1>
    </div>
  `);

  await expect(container.getByRole('heading')).toHaveText('Hello from Lit!');
});
```

### Using a Custom Dev Server

Use Vite, Webpack, or other dev servers instead of http-server:

```typescript
export default withComponentTesting({
  autoStart: false, // Don't auto-start http-server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})(defineConfig({ /* ... */ }));
```

See [examples/playwright.config.custom-server.ts](./examples/playwright.config.custom-server.ts) for complete example.

## API Reference

### Test Fixtures

#### `render(component): Promise<RenderResult>`

Renders a component to the test page.

**Parameters:**
- `component`: HTML string, JSX element, or Lit template

**Returns:** `Promise<RenderResult>`
```typescript
interface RenderResult {
  /** Locator for the rendered component (first child element) */
  container: ExtendedLocator;

  /** Remove the component from the DOM */
  unmount: () => Promise<void>;
}
```

**Example:**
```typescript
const { container, unmount } = await render(<button>Click me</button>);
await expect(container).toBeVisible();
await container.click();
await unmount();
```

---

### Container Methods

The `container` extends Playwright's Locator with these web component-specific methods:

#### `container.setProperty(propertyName, value)`

Set a property on the component.

```typescript
await container.setProperty('value', 'Hello');
await container.setProperty('disabled', true);
await container.setProperty('data', { items: [1, 2, 3] });
```

#### `container.getProperty<T>(propertyName, options?)`

Get a property value with automatic retry.

```typescript
// Simple usage
const value = await container.getProperty<string>('value');

// With custom retry options
const data = await container.getProperty<object>('data', {
  timeout: 2000,        // Wait up to 2 seconds
  interval: 100,        // Check every 100ms
  predicate: (v) => v !== undefined  // Custom validation
});
```

**Options:**
- `timeout`: Maximum wait time in ms (default: 5000)
- `interval`: Retry interval in ms (default: 100)
- `predicate`: Custom validation function

#### `container.callMethod<T>(methodName, ...args)`

Call a method on the component.

```typescript
await container.callMethod('reset');
const result = await container.callMethod<string>('getData', 'param1', 'param2');
```

---

### Standalone Helper Functions

**⚠️ Legacy API** - Prefer container methods when working with rendered components. These are provided for backward compatibility and advanced use cases.

#### `setProperty(page, selector, propertyName, value)`

Set a property using a CSS selector.

```typescript
import { setProperty } from 'webrun-testing';

await setProperty(page, '#my-component', 'value', 'Hello');
```

#### `getProperty(page, selector, propertyName, options?)`

Get a property using a CSS selector with retry.

```typescript
import { getProperty } from 'webrun-testing';

const value = await getProperty(page, '#my-component', 'value', {
  timeout: 2000,
  predicate: (v) => v !== undefined
});
```

#### `call(page, selector, methodName, ...args)`

Call a method using a CSS selector.

```typescript
import { call } from 'webrun-testing';

const result = await call(page, '#my-component', 'reset');
```

#### `getAttributes(page, selector)`

Get all attributes from an element.

```typescript
import { getAttributes } from 'webrun-testing';

const attrs = await getAttributes(page, '#my-component');
expect(attrs['data-value']).toBe('test');
```

---

### Event Handling

#### `spyOn(locator, eventName)`

Spy on events emitted by a component. Returns a getter function to retrieve captured events.

```typescript
import { spyOn } from 'webrun-testing';

// Recommended: Use with container
const { container } = await render(<button>Click</button>);
const getClickEvents = await container.spyOn('click');
await container.click();

const events = await getClickEvents();
expect(events).toHaveLength(1);
expect(events[0]?.type).toBe('click');
```

**⚠️ Legacy signature:** `spyOn(page, selector, eventName)` is also supported.

#### `emit(page, selector, eventName, detail?, options?)`

Emit a custom event on a component.

```typescript
import { emit } from 'webrun-testing';

await emit(page, '#my-component', 'customEvent', { key: 'value' }, {
  bubbles: true,
  composed: true,
  cancelable: true
});
```

#### `waitForEvent(page, selector, eventName, timeout?)`

Wait for a specific event to be emitted.

```typescript
import { waitForEvent } from 'webrun-testing';

const event = await waitForEvent(page, '#my-component', 'loaded', 5000);
expect(event.detail).toBeDefined();
```

#### `getFunctionCalls(page, selector, propertyName)`

Get the call history for a function property set via `setProperty`.

```typescript
import { setProperty, getFunctionCalls } from 'webrun-testing';

await setProperty(page, '#btn', 'onClick', () => {});
await page.locator('#btn').click();

const calls = await getFunctionCalls(page, '#btn', 'onClick');
expect(calls).toHaveLength(1);
```

---

### Component Lifecycle Helpers

#### `waitForComponent(page, tagName, timeout?)`

Wait for a custom element to be defined.

```typescript
import { waitForComponent } from 'webrun-testing';

await waitForComponent(page, 'my-custom-element', 5000);
```

#### `isComponentDefined(page, tagName)`

Check if a custom element is defined.

```typescript
import { isComponentDefined } from 'webrun-testing';

const isDefined = await isComponentDefined(page, 'my-custom-element');
expect(isDefined).toBe(true);
```

---

### Configuration Functions

#### `withComponentTesting(options?)`

Higher-order function that enhances Playwright configuration with component testing capabilities.

```typescript
import { withComponentTesting } from 'webrun-testing';

export default withComponentTesting({
  port: 3000,
  stylesheets: ['/global.css'],
})(defineConfig({ /* ... */ }));
```

#### `getBaseURL(options?)`

Get the base URL for the component testing server.

```typescript
import { getBaseURL } from 'webrun-testing';

const baseURL = getBaseURL({ port: 3000, host: 'localhost' });
// Returns: "http://localhost:3000"
```

## Advanced Topics

### VSCode Extension Integration

The [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension provides a seamless testing experience with zero configuration required.

#### Installation

```bash
code --install-extension ms-playwright.playwright
```

Or install from VSCode:
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Playwright Test for VSCode"
4. Click Install

#### Features

**Test Explorer Integration**
- All your component tests appear automatically in the Test Explorer sidebar
- Hierarchical view of test files, describe blocks, and individual tests
- Filter and search tests by name

**Run and Debug Tests**
- Click the play button next to any test to run it
- Run individual tests, test suites, or entire files
- Debug tests with breakpoints and step-through debugging
- View test results inline in the editor

**Visual Test Debugging**
- Watch mode automatically reruns tests on file changes
- See which tests passed/failed at a glance
- Click on failed tests to see error messages and stack traces
- View screenshots and traces directly in VSCode

**Interactive Locator Picking**
- Use "Record at cursor" to generate selectors interactively
- Pick elements from your rendered components
- Automatically generates optimal Playwright selectors

**Example Workflow:**

```typescript
import { test, expect } from 'webrun-testing';

test('my component test', async ({ render }) => {
  const { container } = await render(<my-button>Click</my-button>);

  // Set a breakpoint here to inspect the rendered component
  await expect(container).toBeVisible();

  // The extension shows test results inline
  await container.click();
});
```

When you open a test file, you'll see:
- ▶️ Run icons next to each test
- 🐛 Debug icons for debugging
- ✅ or ❌ status indicators showing pass/fail state
- Test results in the Test Explorer panel

**No Configuration Required**

The extension automatically:
- Detects your `playwright.config.ts`
- Discovers all test files matching your config
- Shows all component tests in the Test Explorer
- Updates test status in real-time as you code

This works seamlessly with `webrun-testing` - just install the extension and start testing!

### Automatic Visual Regression Testing

Enable automatic screenshot capture after every assertion by setting `autoVrt: true`:

```typescript
export default withComponentTesting({
  autoVrt: true  // Captures screenshots after every assertion
})(defineConfig({ /* ... */ }));
```

**Usage:**

```typescript
import { test, expect } from 'webrun-testing';

test('visual regression', async ({ render }) => {
  const { container } = await render(<button>Click</button>);
  await expect(container).toBeVisible(); // Screenshot captured automatically
});
```

The `expect` from `@wc-tools/webrun` automatically uses autoVrt when enabled - no code changes needed!

### Testing with Lit Templates

```typescript
import { test, expect } from 'webrun-testing';
import { html } from 'lit';

test('renders Lit template', async ({ render }) => {
  const name = 'World';

  const { container } = await render(html`
    <div>
      <h1>Hello, ${name}!</h1>
      <button>Say Hello</button>
    </div>
  `);

  await expect(container.getByRole('heading', { level: 1 })).toHaveText('Hello, World!');
  await expect(container.getByRole('button', { name: 'Say Hello' })).toBeVisible();
});
```

### Testing Shadow DOM

Access Shadow DOM elements using standard Playwright locators:

```typescript
test('accesses shadow DOM', async ({ render }) => {
  const { container } = await render(<my-component />);

  // Shadow DOM elements are automatically accessible
  const shadowButton = container.locator('button');
  await expect(shadowButton).toBeVisible();
  await shadowButton.click();
});
```

### Component Property Testing

```typescript
test('sets and gets component properties', async ({ render }) => {
  const { container } = await render(<my-component />);

  // Set complex property
  await container.setProperty('config', {
    theme: 'dark',
    items: [1, 2, 3]
  });

  // Get with retry
  const config = await container.getProperty<{theme: string}>('config');
  expect(config.theme).toBe('dark');
});
```

### Testing Component Methods

```typescript
test('calls component methods', async ({ render }) => {
  const { container } = await render(<my-form />);

  await container.callMethod('reset');

  const isValid = await container.callMethod<boolean>('validate');
  expect(isValid).toBe(true);

  const data = await container.callMethod<FormData>('getFormData');
  expect(data).toBeDefined();
});
```

## Troubleshooting

### "Element not found" errors

**Problem:** Tests fail with "Element not found" or timeout errors.

**Solutions:**
1. For Stencil components, configure the hydrated class to wait for hydration:
   ```typescript
   export default withComponentTesting({
     hydratedClass: 'hydrated', // Wait for Stencil hydration
     // ... other options
   })(defineConfig({ /* ... */ }));
   ```
   Components automatically wait for the hydrated class before interactions.

2. For custom elements, wait for definition:
   ```typescript
   await waitForComponent(page, 'my-component');
   ```

3. Check that `staticDir` points to the correct build output.

4. As a last resort, wait for visibility (not recommended as primary solution):
   ```typescript
   const { container } = await render(<my-component />);
   await expect(container).toBeVisible();
   ```

### Properties not updating

**Problem:** Component properties don't update or `getProperty()` times out.

**Solutions:**
1. Use the retry feature with custom predicate:
   ```typescript
   const value = await container.getProperty('data', {
     predicate: (v) => v !== undefined,
     timeout: 5000
   });
   ```

2. Ensure the property is actually set in the component.

3. Check browser console for component errors:
   ```typescript
   test('debug', async ({ page }) => {
     page.on('console', msg => console.log(msg.text()));
     // ... your test
   });
   ```

### Import map not working

**Problem:** Module imports fail with import map configuration.

**Solutions:**
1. Import maps must be defined **before** any `<script type="module">`:
   ```typescript
   export default withComponentTesting({
     importMap: { /* ... */ },
     scripts: ['/components.js'] // Loaded after import map
   });
   ```

2. Verify import map URLs are accessible.

3. Check browser DevTools Network tab for 404s.

### TypeScript JSX errors

**Problem:** TypeScript complains about JSX syntax.

**Solution:** Configure `tsconfig.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "webrun-testing"
  }
}
```

### Component not hydrating (Stencil)

**Problem:** Stencil components don't hydrate properly.

**Solutions:**
1. Ensure Stencil loader is included:
   ```typescript
   scripts: ['/build/my-library.esm.js']
   ```

2. Wait for component to be ready:
   ```typescript
   await waitForComponent(page, 'my-component');
   await page.waitForLoadState('networkidle');
   ```

### Tests timing out

**Problem:** Tests timeout waiting for components.

**Solutions:**
1. Increase timeout for slow operations:
   ```typescript
   test('slow operation', async ({ render }) => {
     test.setTimeout(60000); // 60 seconds
     // ... test code
   });
   ```

2. Check if `autoStart` web server is running:
   ```bash
   # Manually start server to debug
   npx http-server ./dist -p 3000
   ```

3. Verify `webServer.url` is accessible.

## Examples

See the [examples/](./examples/) directory for complete working examples:

- **[Stencil Component Library](https://github.com/wc-tools/webrun-stencil)** - Full Stencil example with @wc-tools/webrun
- **[Stencil Configuration](./examples/playwright.config.stencil.ts)** - Stencil configuration reference
- **[Lit Component Library](./examples/playwright.config.lit.ts)** - Lit with import maps
- **[Custom Web Server](./examples/playwright.config.custom-server.ts)** - Using Vite/Webpack

## Roadmap

We're actively working on exciting new features:

🔬 **V8 Code Coverage**
- Native V8 coverage integration for accurate component coverage reports
- Coverage visualization and reporting

🎭 **Typed Component Harnesses**
- Type-safe component test harnesses
- Autocomplete for component APIs
- Better test refactoring support

⚡ **Stencil Hydration Detection**
- Automatic detection of Stencil component hydration
- Wait for components to be fully ready before testing
- Improved test reliability for SSR/hydrated components

Want to contribute? See our [Contributing Guide](CONTRIBUTING.md)!

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup and workflow
- Project architecture and structure
- Code style guidelines
- Testing strategy
- Pull request process

## License

ISC

## Resources

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guide and architecture
- [Playwright Documentation](https://playwright.dev/)
- [Lit Documentation](https://lit.dev/)
- [Stencil Documentation](https://stenciljs.com/)
- [Import Maps Specification](https://github.com/WICG/import-maps)
- [Web Components MDN Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## Acknowledgments

Built with:
- [Playwright](https://playwright.dev/) - Cross-browser testing framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety and developer experience
- [Lit](https://lit.dev/) - Efficient web components library
- [oxlint](https://oxc.rs/) - Fast and accurate linter

---

**Need help?** Open an issue on [GitHub](https://github.com/your-org/@wc-tools/webrun/issues) or check our [Troubleshooting](#troubleshooting) guide.
