import { test, expect } from '../src/index.js';

test.describe('Form Component', () => {
  test('should render a complete form with various controls', async ({ render, page }) => {
    await render(
      <form id="test-form">
        <input type="text" id="username" name="username" placeholder="Username" />
        <input type="email" id="email" name="email" placeholder="Email" />
        <input type="password" id="password" name="password" placeholder="Password" />
        <button type="submit">Submit</button>
      </form>
    );

    await expect(page.locator('#test-form')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should handle form submission', async ({ render, page }) => {
    await render(`
        <form id="submit-form">
          <input type="text" id="name" name="name" />
          <input type="email" id="email" name="email" />
          <button type="submit">Submit</button>
        </form>
        <div id="form-data">Not submitted</div>

        <script>
        document.getElementById('submit-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          document.getElementById('form-data').textContent = JSON.stringify(data);
        });
      </script>
      `);

    const nameInput = page.locator('#name');
    const emailInput = page.locator('#email');
    const submitBtn = page.locator('button[type="submit"]');
    const formData = page.locator('#form-data');

    await nameInput.fill('John Doe');
    await emailInput.fill('john@example.com');

    await submitBtn.click();

    await expect(formData).toHaveText('{"name":"John Doe","email":"john@example.com"}');
  });

  test('should validate form inputs', async ({ render, page }) => {
    await render(`
        <form id="validation-form">
          <input type="email" id="email" name="email" required />
          <input type="number" id="age" name="age" min="18" max="100" required />
          <button type="submit">Submit</button>
        </form>
        <div id="validation-status">Pending</div>

        <script>
        const form = document.getElementById('validation-form');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('email');
          const ageInput = document.getElementById('age');

          if (form.checkValidity()) {
            document.getElementById('validation-status').textContent = 'Valid';
          } else {
            document.getElementById('validation-status').textContent = 'Invalid';
          }
        });
      </script>
      `);

    const emailInput = page.locator('#email');
    const ageInput = page.locator('#age');
    const submitBtn = page.locator('button[type="submit"]');
    const status = page.locator('#validation-status');

    await emailInput.fill('valid@email.com');
    await ageInput.fill('25');
    await submitBtn.click();

    await expect(status).toHaveText('Valid');
  });

  test('should handle checkbox inputs', async ({ render, page }) => {
    await render(`
        <form id="checkbox-form">
          <label>
            <input type="checkbox" id="subscribe" name="subscribe" value="yes" />
            Subscribe to newsletter
          </label>
          <label>
            <input type="checkbox" id="terms" name="terms" value="accepted" />
            Accept terms
          </label>
          <button type="submit">Submit</button>
        </form>
        <div id="checkbox-data">Not submitted</div>

        <script>
        document.getElementById('checkbox-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          document.getElementById('checkbox-data').textContent = JSON.stringify(data);
        });
      </script>
      `);

    const subscribeCheckbox = page.locator('#subscribe');
    const termsCheckbox = page.locator('#terms');
    const submitBtn = page.locator('button[type="submit"]');
    const checkboxData = page.locator('#checkbox-data');

    await subscribeCheckbox.check();
    await termsCheckbox.check();
    await submitBtn.click();

    await expect(checkboxData).toHaveText('{"subscribe":"yes","terms":"accepted"}');
  });

  test('should handle radio button inputs', async ({ render, page }) => {
    await render(`
        <form id="radio-form">
          <label>
            <input type="radio" name="plan" value="basic" id="basic" />
            Basic
          </label>
          <label>
            <input type="radio" name="plan" value="pro" id="pro" />
            Pro
          </label>
          <label>
            <input type="radio" name="plan" value="enterprise" id="enterprise" />
            Enterprise
          </label>
          <button type="submit">Submit</button>
        </form>
        <div id="radio-data">Not selected</div>

        <script>
        document.getElementById('radio-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          document.getElementById('radio-data').textContent = JSON.stringify(data);
        });
      </script>
      `);

    const proRadio = page.locator('#pro');
    const submitBtn = page.locator('button[type="submit"]');
    const radioData = page.locator('#radio-data');

    await proRadio.check();
    await submitBtn.click();

    await expect(radioData).toHaveText('{"plan":"pro"}');
  });

  test('should handle textarea input', async ({ render, page }) => {
    await render(
      <form id="textarea-form">
        <textarea id="message" name="message" placeholder="Enter your message"></textarea>
        <button type="submit">Submit</button>
      </form>
    );

    const textarea = page.locator('#message');
    await textarea.fill('This is a test message with multiple lines.\nLine 2\nLine 3');

    const value = await textarea.inputValue();
    expect(value).toContain('This is a test message');
    expect(value).toContain('Line 2');
  });

  test('should reset form', async ({ render, page }) => {
    await render(
      <form id="reset-form">
        <input type="text" id="name" name="name" defaultValue="" />
        <input type="email" id="email" name="email" defaultValue="" />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
    );

    const nameInput = page.locator('#name');
    const emailInput = page.locator('#email');
    const resetBtn = page.locator('button[type="reset"]');

    await nameInput.fill('John Doe');
    await emailInput.fill('john@example.com');

    await resetBtn.click();

    await expect(nameInput).toHaveValue('');
    await expect(emailInput).toHaveValue('');
  });

  test('should handle form with select dropdown', async ({ render, page }) => {
    await render(
      <form id="select-form">
        <select id="country" name="country">
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    );

    const select = page.locator('#country');
    await select.selectOption('uk');

    await expect(select).toHaveValue('uk');
  });

  test('should prevent default form submission', async ({ render, page }) => {
    await render(`
        <form id="prevent-form">
          <input type="text" id="input" name="input" />
          <button type="submit">Submit</button>
        </form>

        <script>
        document.getElementById('prevent-form').addEventListener('submit', (e) => {
          e.preventDefault();
        });
      </script>
      `);

    const input = page.locator('#input');
    const form = page.locator('#prevent-form');

    await input.fill('test');
    await input.press('Enter');

    // Form should not reload the page
    await expect(form).toBeVisible();
    await expect(input).toHaveValue('test');
  });
});
