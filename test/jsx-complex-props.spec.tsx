import { test, expect } from '../src/index.js';

test.describe('JSX Complex Props Tests', () => {
  test('should handle string props', async ({ render, page }) => {
    await render(
      <div data-testid="string-test" data-value="hello world">
        String Test
      </div>
    );

    const element = page.locator('[data-testid="string-test"]');
    await expect(element).toHaveAttribute('data-value', 'hello world');
  });

  test('should handle number props', async ({ render, page }) => {
    await render(
      <div data-testid="number-test" data-count="42">
        Number Test
      </div>
    );

    const element = page.locator('[data-testid="number-test"]');
    await expect(element).toHaveAttribute('data-count', '42');
  });

  test('should handle boolean props', async ({ render, page }) => {
    await render(
      <button disabled data-testid="boolean-test">
        Disabled Button
      </button>
    );

    const element = page.locator('[data-testid="boolean-test"]');
    await expect(element).toBeDisabled();
  });

  test('should handle multiple class names', async ({ render, page }) => {
    await render(
      <div className="class1 class2 class3" data-testid="class-test">
        Multiple Classes
      </div>
    );

    const element = page.locator('[data-testid="class-test"]');
    await expect(element).toHaveClass('class1 class2 class3');
  });

  test('should handle nested arrays in children', async ({ render, page }) => {
    const items = ['Apple', 'Banana', 'Cherry'];
    const moreItems = ['Date', 'Elderberry'];

    await render(
      <div data-testid="nested-array-test">
        <ul>
          {items.map((item) => (
            <li key={item} className="fruit">
              {item}
            </li>
          ))}
          {moreItems.map((item) => (
            <li key={item} className="fruit">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );

    const listItems = page.locator('.fruit');
    await expect(listItems).toHaveCount(5);
    await expect(listItems.nth(0)).toHaveText('Apple');
    await expect(listItems.nth(4)).toHaveText('Elderberry');
  });

  test('should handle conditional rendering with arrays', async ({ render, page }) => {
    const showFirst = true;
    const showSecond = false;

    await render(
      <div data-testid="conditional-test">
        {showFirst && <p className="first">First Paragraph</p>}
        {showSecond && <p className="second">Second Paragraph</p>}
        {!showSecond && <p className="third">Third Paragraph</p>}
      </div>
    );

    await expect(page.locator('.first')).toBeVisible();
    await expect(page.locator('.second')).not.toBeVisible();
    await expect(page.locator('.third')).toBeVisible();
  });

  test('should handle complex nested structures', async ({ render, page }) => {
    const data = {
      title: 'Test Data',
      items: [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
      ]
    };

    await render(
      <div data-testid="complex-structure">
        <h2>{data.title}</h2>
        <table>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} data-id={item.id}>
                <td className="name">{item.name}</td>
                <td className="value">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    await expect(page.locator('h2')).toHaveText('Test Data');
    await expect(page.locator('tr')).toHaveCount(3);
    await expect(page.locator('tr[data-id="2"] .name')).toHaveText('Item 2');
    await expect(page.locator('tr[data-id="2"] .value')).toHaveText('200');
  });

  test('should handle data attributes with objects serialized', async ({ render, page }) => {
    const config = { theme: 'dark', size: 'large' };

    await render(
      <div
        data-testid="data-attr-test"
        data-config={JSON.stringify(config)}
      >
        Data Attributes
      </div>
    );

    const element = page.locator('[data-testid="data-attr-test"]');
    const configAttr = await element.getAttribute('data-config');
    expect(JSON.parse(configAttr || '{}')).toEqual(config);
  });

  test('should handle special characters in text content', async ({ render, page }) => {
    await render(
      <div data-testid="special-chars">
        <p>Special: &lt; &gt; &amp; &quot;</p>
        <p>Unicode: 你好 مرحبا 🎉</p>
      </div>
    );

    const element = page.locator('[data-testid="special-chars"]');
    await expect(element).toBeVisible();
  });

  test('should handle empty arrays and null values', async ({ render, page }) => {
    const emptyArray: string[] = [];
    const nullValue = null;
    const hasContent = true;

    await render(
      <div data-testid="empty-test">
        <p className="empty-array-test">{emptyArray.length === 0 ? 'Empty' : 'Has Items'}</p>
        <p className="null-test">{nullValue === null ? 'Null' : 'Has Value'}</p>
        <p className="with-content">{hasContent && 'Content'}</p>
      </div>
    );

    // Check conditional rendering based on values
    await expect(page.locator('.empty-array-test')).toHaveText('Empty');
    await expect(page.locator('.null-test')).toHaveText('Null');
    await expect(page.locator('.with-content')).toHaveText('Content');
  });
});

test.describe('JSX Web Component Tests', () => {
  test('should render inline web component definition', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class TestComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<p id="test-output">Component Loaded: ' + this.getAttribute('data-value') + '</p>';
            }
          }
          customElements.define('test-component', TestComponent);
        `}</script>
        <test-component data-value="success"></test-component>
      </div>
    );

    await page.waitForFunction(() => customElements.get('test-component'));

    const output = page.locator('#test-output');
    await expect(output).toHaveText('Component Loaded: success');
  });

  test('should handle web component with properties set via script', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class DataComponent extends HTMLElement {
            constructor() {
              super();
              this._data = {};
            }
            set data(value) {
              this._data = value;
              this.render();
            }
            render() {
              this.innerHTML = '<p id="data-output">Data: ' + JSON.stringify(this._data) + '</p>';
            }
          }
          customElements.define('data-component', DataComponent);

          // Set data after component is defined
          customElements.whenDefined('data-component').then(() => {
            const comp = document.querySelector('data-component');
            comp.data = { test: 'value', count: 42 };
          });
        `}</script>
        <data-component></data-component>
      </div>
    );

    await page.waitForFunction(() => customElements.get('data-component'));
    await page.waitForTimeout(100); // Allow time for property to be set

    const output = page.locator('#data-output');
    await expect(output).toContainText('"test":"value"');
    await expect(output).toContainText('"count":42');
  });
});
