import { test, expect } from '../src/index.js';
import { html } from 'lit';

test.describe('Lit Complex Props Tests', () => {
  test('should handle string values in templates', async ({ render, page }) => {
    const message = 'Hello from Lit';
    const className = 'test-class';

    await render(html`
      <div class="${className}" data-testid="string-test">
        <p>${message}</p>
      </div>
    `);

    const element = page.locator('[data-testid="string-test"]');
    await expect(element).toHaveClass(className);
    await expect(element.locator('p')).toHaveText(message);
  });

  test('should handle number values in templates', async ({ render, page }) => {
    const count = 42;
    const price = 99.99;

    await render(html`
      <div data-testid="number-test">
        <span class="count">${count}</span>
        <span class="price">$${price}</span>
      </div>
    `);

    await expect(page.locator('.count')).toHaveText('42');
    await expect(page.locator('.price')).toHaveText('$99.99');
  });

  test('should handle boolean values in templates', async ({ render, page }) => {
    const isActive = true;
    const isDisabled = false;

    await render(html`
      <div data-testid="boolean-test">
        <button ?disabled=${isDisabled}>Enabled Button</button>
        <div class="${isActive ? 'active' : 'inactive'}">
          Status: ${isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
    `);

    const button = page.locator('button');
    await expect(button).toBeEnabled();
    await expect(button).toHaveText('Enabled Button');

    const status = page.locator('div.active');
    await expect(status).toHaveText('Status: Active');
  });

  test('should handle arrays with map', async ({ render, page }) => {
    const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

    await render(html`
      <div data-testid="array-test">
        <ul>
          ${items.map((item) => html`<li class="fruit">${item}</li>`)}
        </ul>
      </div>
    `);

    const listItems = page.locator('.fruit');
    await expect(listItems).toHaveCount(5);
    await expect(listItems.nth(0)).toHaveText('Apple');
    await expect(listItems.nth(4)).toHaveText('Elderberry');
  });

  test('should handle nested arrays', async ({ render, page }) => {
    const categories = [
      { name: 'Fruits', items: ['Apple', 'Banana'] },
      { name: 'Vegetables', items: ['Carrot', 'Potato'] }
    ];

    await render(html`
      <div data-testid="nested-array-test">
        ${categories.map(
          (category) => html`
            <div class="category">
              <h3>${category.name}</h3>
              <ul>
                ${category.items.map((item) => html`<li>${item}</li>`)}
              </ul>
            </div>
          `
        )}
      </div>
    `);

    const categoryElements = page.locator('.category');
    await expect(categoryElements).toHaveCount(2);

    await expect(categoryElements.nth(0).locator('h3')).toHaveText('Fruits');
    await expect(categoryElements.nth(0).locator('li')).toHaveCount(2);
    await expect(categoryElements.nth(1).locator('h3')).toHaveText('Vegetables');
    await expect(categoryElements.nth(1).locator('li')).toHaveCount(2);
  });

  test('should handle complex objects with nested properties', async ({ render, page }) => {
    const user = {
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Springfield',
        country: 'USA'
      },
      hobbies: ['Reading', 'Gaming', 'Cooking']
    };

    await render(html`
      <div data-testid="object-test" class="user-card">
        <h2>${user.name}</h2>
        <p>Age: ${user.age}</p>
        <div class="address">
          <p>${user.address.street}</p>
          <p>${user.address.city}, ${user.address.country}</p>
        </div>
        <ul class="hobbies">
          ${user.hobbies.map((hobby) => html`<li>${hobby}</li>`)}
        </ul>
      </div>
    `);

    await expect(page.locator('h2')).toHaveText('John Doe');
    await expect(page.locator('.address p').first()).toHaveText('123 Main St');
    await expect(page.locator('.hobbies li')).toHaveCount(3);
    await expect(page.locator('.hobbies li').nth(1)).toHaveText('Gaming');
  });

  test('should handle conditional rendering', async ({ render, page }) => {
    const showMessage = true;
    const showWarning = false;
    const user = { isAdmin: true };

    await render(html`
      <div data-testid="conditional-test">
        ${showMessage ? html`<p class="message">Message visible</p>` : ''}
        ${showWarning ? html`<p class="warning">Warning visible</p>` : ''}
        ${user.isAdmin
          ? html`<button class="admin-btn">Admin Panel</button>`
          : html`<button class="user-btn">User Panel</button>`}
      </div>
    `);

    await expect(page.locator('.message')).toBeVisible();
    await expect(page.locator('.warning')).not.toBeVisible();
    await expect(page.locator('.admin-btn')).toBeVisible();
    await expect(page.locator('.user-btn')).not.toBeVisible();
  });

  test('should handle ternary expressions', async ({ render, page }) => {
    const score = 85;
    const status = score >= 60 ? 'Pass' : 'Fail';
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';

    await render(html`
      <div data-testid="ternary-test">
        <p class="status">${status}</p>
        <p class="grade">${grade}</p>
        <div class="${score >= 60 ? 'pass' : 'fail'}">Score: ${score}</div>
      </div>
    `);

    await expect(page.locator('.status')).toHaveText('Pass');
    await expect(page.locator('.grade')).toHaveText('B');
    await expect(page.locator('div.pass')).toHaveText('Score: 85');
  });

  test('should handle empty arrays and null values', async ({ render, page }) => {
    const emptyArray: string[] = [];
    const nullValue = null;
    const undefinedValue = undefined;

    await render(html`
      <div data-testid="empty-test">
        <div class="empty-array">${emptyArray}</div>
        <div class="null-value">${nullValue}</div>
        <div class="undefined-value">${undefinedValue}</div>
        <div class="with-content">Content</div>
      </div>
    `);

    // Empty elements should have no text content
    await expect(page.locator('.empty-array')).toHaveText('');
    await expect(page.locator('.null-value')).toHaveText('');
    await expect(page.locator('.undefined-value')).toHaveText('');
    await expect(page.locator('.with-content')).toHaveText('Content');
  });

  test('should handle special characters and unicode', async ({ render, page }) => {
    const specialText = '<script>alert("test")</script>';
    const unicodeText = '你好 مرحبا 🎉 ❤️';

    await render(html`
      <div data-testid="special-chars">
        <p class="special">${specialText}</p>
        <p class="unicode">${unicodeText}</p>
      </div>
    `);

    await expect(page.locator('.special')).toHaveText(specialText);
    await expect(page.locator('.unicode')).toHaveText(unicodeText);
  });

  test('should handle attribute expressions', async ({ render, page }) => {
    const id = 'dynamic-id';
    const dataValue = 'test-value';
    const ariaLabel = 'Test Button';

    await render(html`
      <div data-testid="attr-test">
        <button
          id="${id}"
          data-value="${dataValue}"
          aria-label="${ariaLabel}"
        >
          Click Me
        </button>
      </div>
    `);

    const button = page.locator('button');
    await expect(button).toHaveId(id);
    await expect(button).toHaveAttribute('data-value', dataValue);
    await expect(button).toHaveAttribute('aria-label', ariaLabel);
  });
});

test.describe('Lit Web Component Tests', () => {
  test('should render custom web component with Lit', async ({ render, page }) => {
    const value = 'from lit';
    const number = 123;

    await render(html`
      <div>
        <script type="module">
          class LitTestComponent extends HTMLElement {
            connectedCallback() {
              const str = this.getAttribute('data-string');
              const num = this.getAttribute('data-number');
              this.innerHTML = \`<p id="lit-output">String: \${str}, Number: \${num}</p>\`;
            }
          }
          customElements.define('lit-test-component', LitTestComponent);
        </script>
        <lit-test-component
          data-string="${value}"
          data-number="${number}"
        ></lit-test-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('lit-test-component'));

    const output = page.locator('#lit-output');
    await expect(output).toContainText('String: from lit');
    await expect(output).toContainText('Number: 123');
  });

  test('should handle web component with dynamic data', async ({ render, page }) => {
    await render(html`
      <div>
        <script type="module">
          class DataListComponent extends HTMLElement {
            constructor() {
              super();
              this._items = [];
            }
            set items(value) {
              this._items = value;
              this.render();
            }
            render() {
              this.innerHTML = \`<p id="list-output">Items: \${this._items.length}</p>\`;
            }
          }
          customElements.define('data-list-component', DataListComponent);

          customElements.whenDefined('data-list-component').then(() => {
            const comp = document.querySelector('data-list-component');
            comp.items = ['a', 'b', 'c'];
          });
        </script>
        <data-list-component></data-list-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('data-list-component'));
    await page.waitForTimeout(100);

    const output = page.locator('#list-output');
    await expect(output).toHaveText('Items: 3');
  });
});
