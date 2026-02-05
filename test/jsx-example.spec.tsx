import { test, expect } from '../src/index.js';

test.describe('JSX Component Examples', () => {
  test('should render JSX button component', async ({ render, page }) => {
    await render((
        <div>
          <button id="jsx-btn" type="button">
            Click Me with JSX
          </button>
        </div>
      ));

    const button = page.locator('#jsx-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Click Me with JSX');
  });

  test('should render JSX form with inputs', async ({ render, page }) => {
    await render((
        <form id="jsx-form">
          <input type="text" id="username" name="username" placeholder="Username" />
          <input type="email" id="email" name="email" placeholder="Email" />
          <button type="submit">Submit</button>
        </form>
      ));

    await expect(page.locator('#jsx-form')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should render JSX list component', async ({ render, page }) => {
    const items = ['Apple', 'Banana', 'Cherry'];

    await render(
      <div>
        <h2>Fruits</h2>
        <ul id="fruit-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );

    const list = page.locator('#fruit-list');
    await expect(list).toBeVisible();
    await expect(list.locator('li')).toHaveCount(3);
    await expect(list.locator('li').first()).toHaveText('Apple');
  });

  test('should render JSX with attributes', async ({ render, page }) => {
    await render((
        <div>
          <input
            type="text"
            id="styled-input"
            className="input-field"
            data-testid="test-input"
            placeholder="Enter text"
            required={true}
          />
        </div>
      ));

    const input = page.locator('#styled-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Enter text');
    await expect(input).toHaveAttribute('required');
  });

  test('should render nested JSX components', async ({ render, page }) => {
    await render((
        <div className="container">
          <header>
            <h1>Welcome</h1>
          </header>
          <main>
            <section>
              <p id="description">This is a JSX component</p>
            </section>
          </main>
          <footer>
            <span>Footer content</span>
          </footer>
        </div>
      ));

    await expect(page.locator('header h1')).toHaveText('Welcome');
    await expect(page.locator('#description')).toHaveText('This is a JSX component');
    await expect(page.locator('footer span')).toHaveText('Footer content');
  });

  test('should handle JSX with conditional rendering', async ({ render, page }) => {
    const showMessage = true;

    await render((
        <div>
          {showMessage && <p id="message">Message is shown</p>}
          {!showMessage && <p id="no-message">No message</p>}
        </div>
      ));

    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#no-message')).not.toBeVisible();
  });
});
