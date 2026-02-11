# Configuration Examples

This directory contains example Playwright configurations for different web component library setups.

## Examples

### [playwright.config.stencil.ts](./playwright.config.stencil.ts)

Configuration for testing **Stencil** component libraries.

**Key features:**
- Serves the Stencil build output from `./dist`
- Loads the Stencil loader (`/build/my-component-library.esm.js`)
- Auto-starts http-server for convenience
- Includes optional global styles configuration

**Directory structure expected:**
```
dist/
├── build/
│   ├── my-component-library.esm.js  (loader)
│   ├── component-1.esm.js           (lazy-loaded chunks)
│   ├── component-2.esm.js
│   └── ...
└── my-component-library.css          (optional)
```

### [playwright.config.lit.ts](./playwright.config.lit.ts)

Configuration for testing **Lit** component libraries.

**Key features:**
- Serves bundled Lit components from `./dist`
- Configures import map for Lit dependencies from CDN
- Supports both bundled and unbundled component builds
- Auto-starts http-server

**Directory structure expected:**
```
dist/
├── my-components.js      (your component bundle)
├── styles/
│   └── global.css        (optional)
└── ...
```

### [playwright.config.custom-server.ts](./playwright.config.custom-server.ts)

Multiple examples showing **custom web server** configurations.

**Examples included:**
1. **Override with Vite** - Use Vite preview server instead of http-server
2. **Custom server in options** - Provide server config in `withComponentTesting()`
3. **Manual server management** - Start server yourself, no auto-start
4. **Override baseURL** - Use different host/port than default

**Use cases:**
- Need HMR (Hot Module Replacement)
- Already have a dev server configured
- Running on different port/host
- Complex server requirements (proxying, middleware, etc.)

## Configuration Priority

When merging configurations, the priority is:

```
defineConfig.webServer  >  withComponentTesting.webServer  >  defaults
defineConfig.use.baseURL  >  withComponentTesting defaults
```

This means you can always override the auto-generated settings by providing them in `defineConfig()`.

## Quick Start

1. Copy the example that matches your setup
2. Rename to `playwright.config.ts` in your project root
3. Update the paths and script names to match your build output
4. Run tests: `npx playwright test`

## Common Configurations

### Import Maps

Use import maps to alias module paths:

```typescript
importMap: {
  imports: {
    'lit': 'https://cdn.jsdelivr.net/npm/lit@3/+esm',
    '@my-lib/': '/components/'
  }
}
```

### Global Styles

Include CSS in all tests:

```typescript
stylesheets: [
  '/styles/reset.css',
  '/styles/tokens.css'
]
```

### Global Scripts

Load scripts before components:

```typescript
scripts: [
  '/polyfills/webcomponents.js',
  '/build/my-library.esm.js'
]
```

### Inline Styles

Add CSS directly:

```typescript
globalStyles: `
  * { margin: 0; padding: 0; }
  body { font-family: sans-serif; }
`
```

## Troubleshooting

### Components not loading

1. Check that `staticDir` points to your build output
2. Verify script paths in `scripts` array are correct
3. Ensure components are built before running tests

### Import errors

1. Check import map configuration
2. Verify CDN URLs are accessible
3. Ensure module paths match your imports

### Server not starting

1. Check port is not already in use
2. Verify `staticDir` exists
3. Check `command` in webServer config is valid

## Additional Resources

- [Stencil Build Output](https://stenciljs.com/docs/config)
- [Lit Build Tools](https://lit.dev/docs/tools/overview/)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [Import Maps Spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
