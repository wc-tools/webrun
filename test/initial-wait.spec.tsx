import { test } from '../src/index.js';

test.describe('Initial Wait for Element', () => {
  test('waits for hydration class before proceeding', async ({ render, expect }) => {
    const { container } = await render(
      <div className="hydrated">
        <h1>Component Ready</h1>
      </div>
    );

    // Should only reach here after .hydrated element is visible
    await expect(container.getByRole('heading')).toHaveText('Component Ready');
  });

  test('waits for multiple hydrated components', async ({ render, expect }) => {
    const { container } = await render(
      <div>
        <div className="hydrated">
          <h1>First Component</h1>
        </div>
        <div className="hydrated">
          <h2>Second Component</h2>
        </div>
        <div className="hydrated">
          <h3>Third Component</h3>
        </div>
      </div>
    );

    // Should only reach here after ALL .hydrated elements are visible
    await expect(container.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(container.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(container.getByRole('heading', { level: 3 })).toBeVisible();
  });

  test('skipVisibilityCheck waits for attached instead of visible', async ({ render, expect }) => {
    const { container } = await render(
      <div className="hydrated" style="display: none;">
        <h1>Hidden Component</h1>
      </div>,
      { skipVisibilityCheck: true }
    );

    // Should work with hidden elements when skipVisibilityCheck is true
    await expect(container).toBeAttached();
  });

  test('skipVisibilityCheck works with multiple hidden components', async ({ render, expect }) => {
    const { container } = await render(
      <div>
        <div className="hydrated" style="display: none;">
          <h1>Hidden 1</h1>
        </div>
        <div className="hydrated" style="display: none;">
          <h2>Hidden 2</h2>
        </div>
      </div>,
      { skipVisibilityCheck: true }
    );

    // Should work with multiple hidden elements when skipVisibilityCheck is true
    await expect(container).toBeAttached();
  });
});
