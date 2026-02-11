import { test, expect } from '../src/index.js';

test.describe('Button Component', () => {
  test('should render a basic button', async ({ render, page }) => {
    await render(<button id="test-btn">Click Me</button>);

    const button = page.locator('#test-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Click Me');
  });

  test('should handle button clicks', async ({ render, page }) => {
    await render(`
        <button id="click-btn">Click Counter</button>
        <span id="counter">0</span>
        <script>
          let count = 0;
          document.getElementById('click-btn').addEventListener('click', () => {
            count++;
            document.getElementById('counter').textContent = count.toString();
          });
        </script>
      `);

    const button = page.locator('#click-btn');
    const counter = page.locator('#counter');

    await expect(counter).toHaveText('0');

    await button.click();
    await expect(counter).toHaveText('1');

    await button.click();
    await expect(counter).toHaveText('2');
  });

  test('should apply custom styles to button', async ({ render, page }) => {
    await render(`
        <style>
          #styled-btn {
            background-color: rgb(255, 0, 0);
            color: rgb(255, 255, 255);
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
          }
        </style>
        <button id="styled-btn">Styled Button</button>
      `);

    const button = page.locator('#styled-btn');
    await expect(button).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should handle disabled state', async ({ render, page }) => {
    await render(`
        <button id="toggle-btn">Toggle</button>
        <button id="target-btn">Target</button>
        <script>
          document.getElementById('toggle-btn').addEventListener('click', () => {
            const target = document.getElementById('target-btn');
            target.disabled = !target.disabled;
          });
        </script>
      `);

    const toggleBtn = page.locator('#toggle-btn');
    const targetBtn = page.locator('#target-btn');

    await expect(targetBtn).toBeEnabled();

    await toggleBtn.click();
    await expect(targetBtn).toBeDisabled();

    await toggleBtn.click();
    await expect(targetBtn).toBeEnabled();
  });

  test('should unmount button component', async ({ render, page }) => {
    const { unmount } = await render(<button id="unmount-btn">Unmount Me</button>);

    const button = page.locator('#unmount-btn');
    await expect(button).toBeVisible();

    await unmount();
    await expect(button).not.toBeVisible();
  });
});
