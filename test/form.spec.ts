import { test, expect } from '../src/index.js';

test.describe('Form Component', () => {
  test('should render a complete form with various controls', async ({ render, page }) => {
    await render(`
        <form id="test-form">
          <input type="text" id="username" name="username" placeholder="Username" />
          <input type="email" id="email" name="email" placeholder="Email" />
          <input type="password" id="password" name="password" placeholder="Password" />
          <button type="submit">Submit</button>
        </form>
      `);

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
        <div id="checkbox-state">unchecked</div>
      
        <script>
        document.getElementById('checkbox-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const subscribe = document.getElementById('subscribe').checked;
          const terms = document.getElementById('terms').checked;
          document.getElementById('checkbox-state').textContent =
            'subscribe:' + subscribe + ',terms:' + terms;
        });
      </script>
      `);

    const subscribeCheckbox = page.locator('#subscribe');
    const termsCheckbox = page.locator('#terms');
    const submitBtn = page.locator('button[type="submit"]');
    const state = page.locator('#checkbox-state');

    await subscribeCheckbox.check();
    await termsCheckbox.check();
    await submitBtn.click();

    await expect(state).toHaveText('subscribe:true,terms:true');

    await subscribeCheckbox.uncheck();
    await submitBtn.click();

    await expect(state).toHaveText('subscribe:false,terms:true');
  });

  test('should handle radio button inputs', async ({ render, page }) => {
    await render(`
        <form id="radio-form">
          <label>
            <input type="radio" name="size" value="small" />
            Small
          </label>
          <label>
            <input type="radio" name="size" value="medium" />
            Medium
          </label>
          <label>
            <input type="radio" name="size" value="large" />
            Large
          </label>
          <button type="submit">Submit</button>
        </form>
        <div id="selected-size">none</div>
      
        <script>
        document.getElementById('radio-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const selectedSize = document.querySelector('input[name="size"]:checked');
          document.getElementById('selected-size').textContent =
            selectedSize ? selectedSize.value : 'none';
        });
      </script>
      `);

    const mediumRadio = page.locator('input[value="medium"]');
    const largeRadio = page.locator('input[value="large"]');
    const submitBtn = page.locator('button[type="submit"]');
    const selectedSize = page.locator('#selected-size');

    await mediumRadio.check();
    await submitBtn.click();
    await expect(selectedSize).toHaveText('medium');

    await largeRadio.check();
    await submitBtn.click();
    await expect(selectedSize).toHaveText('large');
  });

  test('should handle textarea input', async ({ render, page }) => {
    await render(`
        <form id="textarea-form">
          <textarea id="comment" name="comment" rows="4" cols="50"></textarea>
          <button type="submit">Submit</button>
        </form>
        <div id="comment-length">0</div>
      
        <script>
        document.getElementById('textarea-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const comment = document.getElementById('comment').value;
          document.getElementById('comment-length').textContent = comment.length.toString();
        });
      </script>
      `);

    const textarea = page.locator('#comment');
    const submitBtn = page.locator('button[type="submit"]');
    const length = page.locator('#comment-length');

    const testComment = 'This is a test comment with multiple words.';
    await textarea.fill(testComment);
    await submitBtn.click();

    await expect(length).toHaveText(testComment.length.toString());
  });

  test('should reset form', async ({ render, page }) => {
    await render(`
        <form id="reset-form">
          <input type="text" id="username" name="username" value="" />
          <input type="email" id="email" name="email" value="" />
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </form>
      `);

    const usernameInput = page.locator('#username');
    const emailInput = page.locator('#email');
    const resetBtn = page.locator('button[type="reset"]');

    await usernameInput.fill('TestUser');
    await emailInput.fill('test@example.com');

    await expect(usernameInput).toHaveValue('TestUser');
    await expect(emailInput).toHaveValue('test@example.com');

    await resetBtn.click();

    await expect(usernameInput).toHaveValue('');
    await expect(emailInput).toHaveValue('');
  });

  test('should handle form with select dropdown', async ({ render, page }) => {
    await render(`
        <form id="dropdown-form">
          <input type="text" id="product-name" name="productName" />
          <select id="category" name="category">
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
          </select>
          <button type="submit">Submit</button>
        </form>
        <div id="form-output">Not submitted</div>
      
        <script>
        document.getElementById('dropdown-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          document.getElementById('form-output').textContent = JSON.stringify(data);
        });
      </script>
      `);

    const productName = page.locator('#product-name');
    const category = page.locator('#category');
    const submitBtn = page.locator('button[type="submit"]');
    const output = page.locator('#form-output');

    await productName.fill('Laptop');
    await category.selectOption('electronics');
    await submitBtn.click();

    await expect(output).toHaveText('{"productName":"Laptop","category":"electronics"}');
  });

  test('should prevent default form submission', async ({ render, page }) => {
    await render(`
        <form id="prevent-form" action="/submit">
          <input type="text" id="data" name="data" />
          <button type="submit">Submit</button>
        </form>
        <div id="prevented">false</div>
      
        <script>
        document.getElementById('prevent-form').addEventListener('submit', (e) => {
          e.preventDefault();
          document.getElementById('prevented').textContent = 'true';
        });
      </script>
      `);

    const dataInput = page.locator('#data');
    const submitBtn = page.locator('button[type="submit"]');
    const prevented = page.locator('#prevented');

    await dataInput.fill('test data');
    await submitBtn.click();

    await expect(prevented).toHaveText('true');

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/submit');
  });
});
