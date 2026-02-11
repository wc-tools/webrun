import { test, expect } from '../src/index.js';

test.describe('AutoVRT', () => {
  test('captures screenshots automatically', async ({ render }) => {
    const { container } = await render(
      <div>
        <h1>AutoVRT Test</h1>
        <button id="test-btn">Click Me</button>
      </div>
    );

    // These assertions should trigger automatic screenshots when autoVrt is enabled
    await expect(container.getByRole('heading')).toBeVisible();
    await expect(container.getByRole('heading')).toHaveText('AutoVRT Test');
    await expect(container.getByRole('button')).toBeVisible();
  });
});
