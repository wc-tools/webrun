import { test, expect } from '../src/index.js';

test.describe('Select Component', () => {
  test('should render a basic select dropdown', async ({ render, page }) => {
    await render(`
        <select id="fruit-select">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="orange">Orange</option>
        </select>
      `);

    const select = page.locator('#fruit-select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('apple');
  });

  test('should select different options', async ({ render, page }) => {
    await render(`
        <select id="color-select">
          <option value="">Choose a color</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
        </select>
      `);

    const select = page.locator('#color-select');

    await select.selectOption('red');
    await expect(select).toHaveValue('red');

    await select.selectOption('blue');
    await expect(select).toHaveValue('blue');

    await select.selectOption('green');
    await expect(select).toHaveValue('green');
  });

  test('should trigger change event on selection', async ({ render, page }) => {
    await render(`
        <select id="change-select">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
        <div id="selected-value">No selection</div>
      
        <script>
        document.getElementById('change-select').addEventListener('change', (e) => {
          document.getElementById('selected-value').textContent = 'Selected: ' + e.target.value;
        });
      </script>
      `);

    const select = page.locator('#change-select');
    const display = page.locator('#selected-value');

    await expect(display).toHaveText('No selection');

    await select.selectOption('option2');
    await expect(display).toHaveText('Selected: option2');

    await select.selectOption('option3');
    await expect(display).toHaveText('Selected: option3');
  });

  test('should handle multiple select', async ({ render, page }) => {
    await render(`
        <select id="multi-select" multiple>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="rust">Rust</option>
        </select>
      `);

    const select = page.locator('#multi-select');

    await select.selectOption(['javascript', 'rust']);

    const selectedValues = await select.evaluate((el: HTMLSelectElement) => {
      return Array.from(el.selectedOptions).map(option => option.value);
    });

    expect(selectedValues).toEqual(['javascript', 'rust']);
  });

  test('should handle disabled options', async ({ render, page }) => {
    await render(`
        <select id="disabled-option-select">
          <option value="enabled1">Enabled 1</option>
          <option value="disabled" disabled>Disabled Option</option>
          <option value="enabled2">Enabled 2</option>
        </select>
      `);

    const disabledOption = page.locator('#disabled-option-select option[value="disabled"]');
    await expect(disabledOption).toBeDisabled();
  });

  test('should style select element', async ({ render, page }) => {
    await render(`
        <style>
        #styled-select {
          width: 200px;
          border: 2px solid rgb(0, 128, 0);
          font-size: 16px;
        }
      </style>
        <select id="styled-select">
          <option value="1">One</option>
          <option value="2">Two</option>
        </select>
      
      `);

    const select = page.locator('#styled-select');
    await expect(select).toHaveCSS('border-top-color', 'rgb(0, 128, 0)');
    await expect(select).toHaveCSS('font-size', '16px');
  });
});
