/**
 * Tests from README examples
 * These tests verify that all examples in the README work correctly
 */

import { test, expect, spyOn } from '../src/index.js';

test.describe('README Quick Start Examples', () => {
  test('button handles clicks', async ({ render }) => {
    // Render component
    const { container } = await render(
      <button id="my-button">Click me</button>
    );

    // Spy on click events
    const getClickEvents = await spyOn(container, 'click');

    // Interact with component
    await container.click();
    await container.click();

    // Assert behavior
    const events = await getClickEvents();
    expect(events).toHaveLength(2);
  });
});

test.describe('README Component Lifecycle Examples', () => {
  test('unmount component', async ({ render }) => {
    const { container, unmount } = await render(
      <button>Click Me</button>
    );

    await expect(container).toBeVisible();

    // Unmount the component
    await unmount();

    // Verify it's been cleared
    await expect(container).not.toBeVisible();
  });
});

test.describe('README Testing Forms Examples', () => {
  test('handles form submission', async ({ render, page }) => {
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
    const getSubmitEvents = await spyOn(container, 'submit');

    // Prevent default form submission to avoid navigation
    await page.evaluate(() => {
      const form = document.querySelector('form');
      form?.addEventListener('submit', (e) => e.preventDefault());
    });

    // Fill form using accessible queries
    await container.getByLabel('Email').fill('user@example.com');
    await container.getByLabel('Password').fill('secret123');
    await container.getByRole('button', { name: 'Login' }).click();

    // Verify submission
    const events = await getSubmitEvents();
    expect(events).toHaveLength(1);
  });
});

test.describe('README Event Handlers Examples', () => {
  test('tracks button clicks', async ({ render }) => {
    const { container } = await render(
      <button id="counter">Click count: 0</button>
    );

    // Set up event spy
    const getClickEvents = await spyOn(container, 'click');

    // Trigger multiple clicks
    await container.click();
    await container.click();
    await container.click();

    // Verify all clicks were captured
    const events = await getClickEvents();
    expect(events).toHaveLength(3);
    expect(events[0]?.type).toBe('click');
  });
});

test.describe('README Accessibility Examples', () => {
  test('has proper ARIA attributes', async ({ render, page }) => {
    await render(
      <button
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="main-menu"
      >
        Menu
      </button>
    );

    const button = page.locator('button');

    // Verify ARIA attributes
    await expect(button).toHaveAttribute('aria-label', 'Open menu');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'main-menu');

    // Verify accessible name
    await expect(button).toHaveAccessibleName('Open menu');
  });
});
