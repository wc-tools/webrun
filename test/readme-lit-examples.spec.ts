/**
 * Tests from README Lit examples
 * These tests verify that all Lit examples in the README work correctly
 */

import { test, expect } from '../src/index.js';
import { html } from 'lit';

test.describe('README Lit Component Examples', () => {
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
});
