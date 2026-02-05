import { test, expect } from '../src/index.js';
import { html } from 'lit';

test.describe('Lit Callback Function Tests', () => {
  test('should pass callback function to web component and verify execution', async ({ render, page }) => {
    await render(html`
      <div>
        <script type="module">
          class CallbackComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<button id="trigger-btn">Click Me</button>';

              const btn = this.querySelector('#trigger-btn');
              btn.addEventListener('click', () => {
                if (this.onClick) {
                  this.onClick('button clicked');
                }
              });
            }
          }
          customElements.define('callback-component', CallbackComponent);

          // Setup callback tracking
          window.callbackResults = [];

          customElements.whenDefined('callback-component').then(() => {
            const comp = document.querySelector('callback-component');
            comp.onClick = (data) => {
              window.callbackResults.push({ called: true, data });
            };
          });
        </script>
        <callback-component></callback-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('callback-component'));
    await page.waitForTimeout(100);

    // Verify callback hasn't been called yet
    let results = await page.evaluate(() => window.callbackResults);
    expect(results).toHaveLength(0);

    // Click the button to trigger callback
    await page.click('#trigger-btn');
    await page.waitForTimeout(50);

    // Verify callback was called
    results = await page.evaluate(() => window.callbackResults);
    expect(results).toHaveLength(1);
    expect(results?.[0]).toEqual({ called: true, data: 'button clicked' });
  });

  test('should handle multiple callback invocations', async ({ render, page }) => {
    await render(html`
      <div>
        <script type="module">
          class MultiCallbackComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<button id="multi-btn">Click Multiple Times</button>';

              const btn = this.querySelector('#multi-btn');
              btn.addEventListener('click', () => {
                if (this.onEvent) {
                  this.onEvent('click');
                }
              });
            }

            triggerCallback(count) {
              for (let i = 0; i < count; i++) {
                if (this.onEvent) {
                  this.onEvent(\`call-\${i + 1}\`);
                }
              }
            }
          }
          customElements.define('multi-callback-component', MultiCallbackComponent);

          window.eventLog = [];

          customElements.whenDefined('multi-callback-component').then(() => {
            const comp = document.querySelector('multi-callback-component');
            comp.onEvent = (eventName) => {
              window.eventLog.push(eventName);
            };

            // Expose component for testing
            window.testComponent = comp;
          });
        </script>
        <multi-callback-component></multi-callback-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('multi-callback-component'));
    await page.waitForTimeout(100);

    // Trigger callback 3 times programmatically
    await page.evaluate(() => (window.testComponent as any).triggerCallback(3));

    // Verify all callbacks were called
    const eventLog = await page.evaluate(() => window.eventLog);
    expect(eventLog).toEqual(['call-1', 'call-2', 'call-3']);
  });

  test('should pass complex data through callback', async ({ render, page }) => {
    await render(html`
      <div>
        <script type="module">
          class DataCallbackComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<button id="data-btn">Send Data</button>';

              const btn = this.querySelector('#data-btn');
              btn.addEventListener('click', () => {
                if (this.onData) {
                  const complexData = {
                    timestamp: Date.now(),
                    user: { name: 'Test User', id: 123 },
                    items: ['a', 'b', 'c'],
                    nested: { level: { deep: true } }
                  };
                  this.onData(complexData);
                }
              });
            }
          }
          customElements.define('data-callback-component', DataCallbackComponent);

          window.receivedData = null;

          customElements.whenDefined('data-callback-component').then(() => {
            const comp = document.querySelector('data-callback-component');
            comp.onData = (data) => {
              window.receivedData = data;
            };
          });
        </script>
        <data-callback-component></data-callback-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('data-callback-component'));
    await page.waitForTimeout(100);

    // Click to trigger callback with complex data
    await page.click('#data-btn');
    await page.waitForTimeout(50);

    // Verify complex data was passed correctly
    const receivedData = await page.evaluate(() => window.receivedData) as any;
    expect(receivedData).toBeTruthy();
    expect(receivedData.user).toEqual({ name: 'Test User', id: 123 });
    expect(receivedData.items).toEqual(['a', 'b', 'c']);
    expect(receivedData.nested.level.deep).toBe(true);
  });

  test('should handle callback with return value', async ({ render, page }) => {
    await render(html`
      <div>
        <script type="module">
          class ReturnCallbackComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div id="result">No result</div>';
            }

            compute() {
              if (this.onCompute) {
                const result = this.onCompute(10, 20);
                this.querySelector('#result').textContent = 'Result: ' + result;
              }
            }
          }
          customElements.define('return-callback-component', ReturnCallbackComponent);

          customElements.whenDefined('return-callback-component').then(() => {
            const comp = document.querySelector('return-callback-component');
            comp.onCompute = (a, b) => {
              return a + b;
            };
            window.testComponent = comp;
          });
        </script>
        <return-callback-component></return-callback-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('return-callback-component'));
    await page.waitForTimeout(100);

    // Trigger computation
    await page.evaluate(() => (window.testComponent as any).compute());

    // Verify the result was computed and displayed
    const result = page.locator('#result');
    await expect(result).toHaveText('Result: 30');
  });

  test('should track callback invocation count', async ({ render, page }) => {
    await render(html`
      <div>
        <script type="module">
          class CounterComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <button id="inc-btn">Increment</button>
                <div id="count">0</div>
              \`;

              const btn = this.querySelector('#inc-btn');
              btn.addEventListener('click', () => {
                if (this.onIncrement) {
                  this.onIncrement();
                }
              });
            }
          }
          customElements.define('counter-component', CounterComponent);

          window.callCount = 0;

          customElements.whenDefined('counter-component').then(() => {
            const comp = document.querySelector('counter-component');
            comp.onIncrement = () => {
              window.callCount++;
              document.querySelector('#count').textContent = window.callCount;
            };
          });
        </script>
        <counter-component></counter-component>
      </div>
    `);

    await page.waitForFunction(() => customElements.get('counter-component'));
    await page.waitForTimeout(100);

    // Click button multiple times
    await page.click('#inc-btn');
    await page.click('#inc-btn');
    await page.click('#inc-btn');

    // Verify callback was called 3 times
    const callCount = await page.evaluate(() => window.callCount);
    expect(callCount).toBe(3);

    const display = page.locator('#count');
    await expect(display).toHaveText('3');
  });
});
