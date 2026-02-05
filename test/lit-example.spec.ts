import { test, expect } from '../src/index.js';
import { html } from 'lit';

test.describe('Lit HTML Component Examples', () => {
  test('should render basic Lit template', async ({ render, page }) => {
    await render(html`
      <div>
        <h1 id="title">Hello Lit!</h1>
      </div>
    `);

    const title = page.locator('#title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Hello Lit!');
  });

  test('should render Lit template with variables', async ({ render, page }) => {
    const name = 'World';
    const count = 42;

    await render(html`
      <div>
        <p id="greeting">Hello, ${name}!</p>
        <p id="count">Count: ${count}</p>
      </div>
    `);

    await expect(page.locator('#greeting')).toHaveText('Hello, World!');
    await expect(page.locator('#count')).toHaveText('Count: 42');
  });

  test('should render Lit template with array mapping', async ({ render, page }) => {
    const items = ['Apple', 'Banana', 'Cherry'];

    await render(html`
      <div>
        <h2>Fruits</h2>
        <ul id="fruit-list">
          ${items.map((item) => html`<li>${item}</li>`)}
        </ul>
      </div>
    `);

    const list = page.locator('#fruit-list');
    await expect(list).toBeVisible();
    await expect(list.locator('li')).toHaveCount(3);
    await expect(list.locator('li').first()).toHaveText('Apple');
    await expect(list.locator('li').nth(1)).toHaveText('Banana');
    await expect(list.locator('li').nth(2)).toHaveText('Cherry');
  });

  test('should render Lit template with conditionals', async ({ render, page }) => {
    const showMessage = true;

    await render(html`
      <div>
        ${showMessage
          ? html`<p id="message">Message is shown</p>`
          : html`<p id="no-message">No message</p>`}
      </div>
    `);

    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#no-message')).not.toBeVisible();
  });

  test('should render Lit template with attributes', async ({ render, page }) => {
    const buttonClass = 'primary';
    const isDisabled = false;
    const dataTestId = 'my-button';

    await render(html`
      <button
        id="styled-btn"
        class="${buttonClass}"
        ?disabled="${isDisabled}"
        data-testid="${dataTestId}"
      >
        Click Me
      </button>
    `);

    const button = page.locator('#styled-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass('primary');
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveAttribute('data-testid', 'my-button');
  });

  test('should render nested Lit templates', async ({ render, page }) => {
    const header = html`
      <header>
        <h1>Welcome</h1>
      </header>
    `;

    const content = html`
      <main>
        <p id="description">This is a Lit template</p>
      </main>
    `;

    const footer = html`
      <footer>
        <span>Footer content</span>
      </footer>
    `;

    await render(html`
      <div class="container">
        ${header} ${content} ${footer}
      </div>
    `);

    await expect(page.locator('header h1')).toHaveText('Welcome');
    await expect(page.locator('#description')).toHaveText('This is a Lit template');
    await expect(page.locator('footer span')).toHaveText('Footer content');
  });

  test('should render Lit template with event attributes', async ({ render, page }) => {
    await render(html`
      <div>
        <button id="click-btn">Count: 0</button>
        <script>
          let count = 0;
          document.getElementById('click-btn').addEventListener('click', () => {
            count++;
            document.getElementById('click-btn').textContent = \`Count: \${count}\`;
          });
        </script>
      </div>
    `);

    const button = page.locator('#click-btn');
    await expect(button).toHaveText('Count: 0');

    await button.click();
    await expect(button).toHaveText('Count: 1');

    await button.click();
    await expect(button).toHaveText('Count: 2');
  });

  test('should render Lit form template', async ({ render, page }) => {
    await render(html`
      <form id="lit-form">
        <input type="text" id="username" name="username" placeholder="Username" />
        <input type="email" id="email" name="email" placeholder="Email" />
        <button type="submit">Submit</button>
      </form>
    `);

    await expect(page.locator('#lit-form')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();

    await page.locator('#username').fill('john');
    await page.locator('#email').fill('john@example.com');
  });

  test('should render Lit template with complex expressions', async ({ render, page }) => {
    const user = {
      name: 'Alice',
      age: 30,
      role: 'Developer',
    };

    await render(html`
      <div class="profile">
        <h2 id="name">${user.name}</h2>
        <p id="age">Age: ${user.age}</p>
        <p id="role">Role: ${user.role}</p>
        <p id="status">${user.age >= 18 ? 'Adult' : 'Minor'}</p>
      </div>
    `);

    await expect(page.locator('#name')).toHaveText('Alice');
    await expect(page.locator('#age')).toHaveText('Age: 30');
    await expect(page.locator('#role')).toHaveText('Role: Developer');
    await expect(page.locator('#status')).toHaveText('Adult');
  });
});
