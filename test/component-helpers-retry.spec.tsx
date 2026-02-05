import { test, expect, getProperty, setProperty, waitForComponent } from '../src/index.js';

test.describe('Component Helper Retry Tests', () => {
  test('getProperty should retry until property is set', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class DelayedPropertyComponent extends HTMLElement {
            constructor() {
              super();
              this._value = undefined;
            }

            connectedCallback() {
              this.innerHTML = '<div>Component loaded</div>';

              // Set property after a delay
              setTimeout(() => {
                this._value = 'delayed-value';
              }, 500);
            }

            get value() {
              return this._value;
            }
          }
          customElements.define('delayed-property-component', DelayedPropertyComponent);
        `}</script>
        <delayed-property-component></delayed-property-component>
      </div>
    );

    await waitForComponent(page, 'delayed-property-component');

    // This will retry until the value is set (after 500ms)
    const value = await getProperty<string>(page, 'delayed-property-component', 'value', {
      timeout: 2000,
      interval: 50
    });

    expect(value).toBe('delayed-value');
  });

  test('getProperty should use predicate to wait for specific value', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class CounterComponent extends HTMLElement {
            constructor() {
              super();
              this._count = 0;
            }

            connectedCallback() {
              this.innerHTML = '<div id="display">0</div>';

              // Increment count every 100ms
              this.interval = setInterval(() => {
                this._count++;
                this.querySelector('#display').textContent = this._count;
              }, 100);
            }

            get count() {
              return this._count;
            }

            disconnectedCallback() {
              if (this.interval) {
                clearInterval(this.interval);
              }
            }
          }
          customElements.define('counter-component', CounterComponent);
        `}</script>
        <counter-component></counter-component>
      </div>
    );

    await waitForComponent(page, 'counter-component');

    // Wait until count reaches 5
    const count = await getProperty<number>(page, 'counter-component', 'count', {
      timeout: 3000,
      interval: 50,
      predicate: (value) => value >= 5
    });

    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('getProperty should timeout if property is never set', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class NoPropertyComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div>No property will be set</div>';
            }
          }
          customElements.define('no-property-component', NoPropertyComponent);
        `}</script>
        <no-property-component></no-property-component>
      </div>
    );

    await waitForComponent(page, 'no-property-component');

    // This should timeout because missingProperty is never set
    await expect(
      getProperty(page, 'no-property-component', 'missingProperty', {
        timeout: 500,
        interval: 50
      })
    ).rejects.toThrow(/Timeout 500ms exceeded/);
  });

  test('getProperty should timeout if predicate is never satisfied', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class LimitedCounterComponent extends HTMLElement {
            constructor() {
              super();
              this._count = 0;
            }

            connectedCallback() {
              this.innerHTML = '<div>Counting to 3</div>';

              // Only count to 3
              const interval = setInterval(() => {
                this._count++;
                if (this._count >= 3) {
                  clearInterval(interval);
                }
              }, 100);
            }

            get count() {
              return this._count;
            }
          }
          customElements.define('limited-counter-component', LimitedCounterComponent);
        `}</script>
        <limited-counter-component></limited-counter-component>
      </div>
    );

    await waitForComponent(page, 'limited-counter-component');

    // This should timeout because count will never reach 10
    await expect(
      getProperty<number>(page, 'limited-counter-component', 'count', {
        timeout: 1000,
        interval: 50,
        predicate: (value) => value >= 10
      })
    ).rejects.toThrow(/Timeout 1000ms exceeded.*to satisfy predicate/);
  });

  test('getProperty should work with complex object values', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class DataComponent extends HTMLElement {
            constructor() {
              super();
              this._data = undefined;
            }

            connectedCallback() {
              this.innerHTML = '<div>Loading data...</div>';

              // Simulate async data loading
              setTimeout(() => {
                this._data = {
                  users: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' }
                  ],
                  metadata: { total: 2 }
                };
              }, 300);
            }

            get data() {
              return this._data;
            }
          }
          customElements.define('data-component', DataComponent);
        `}</script>
        <data-component></data-component>
      </div>
    );

    await waitForComponent(page, 'data-component');

    // Wait for data to be loaded
    const data = await getProperty<{ users: Array<{ id: number; name: string }>; metadata: { total: number } }>(
      page,
      'data-component',
      'data',
      {
        timeout: 2000,
        interval: 50
      }
    );

    expect(data.users).toHaveLength(2);
    expect(data.users[0]?.name).toBe('Alice');
    expect(data.metadata.total).toBe(2);
  });

  test('getProperty should work with predicate on object properties', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class StatusComponent extends HTMLElement {
            constructor() {
              super();
              this._status = { state: 'initializing', progress: 0 };
            }

            connectedCallback() {
              this.innerHTML = '<div>Loading...</div>';

              // Simulate loading progress
              const interval = setInterval(() => {
                this._status.progress += 10;
                if (this._status.progress >= 100) {
                  this._status.state = 'ready';
                  clearInterval(interval);
                }
              }, 50);
            }

            get status() {
              return this._status;
            }
          }
          customElements.define('status-component', StatusComponent);
        `}</script>
        <status-component></status-component>
      </div>
    );

    await waitForComponent(page, 'status-component');

    // Wait until status is ready
    const status = await getProperty<{ state: string; progress: number }>(
      page,
      'status-component',
      'status',
      {
        timeout: 3000,
        interval: 50,
        predicate: (value) => value.state === 'ready'
      }
    );

    expect(status.state).toBe('ready');
    expect(status.progress).toBe(100);
  });

  test('getProperty should return immediately if property is already set', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class ImmediateComponent extends HTMLElement {
            constructor() {
              super();
              this._ready = true; // Set immediately
            }

            connectedCallback() {
              this.innerHTML = '<div>Ready</div>';
            }

            get ready() {
              return this._ready;
            }
          }
          customElements.define('immediate-component', ImmediateComponent);
        `}</script>
        <immediate-component></immediate-component>
      </div>
    );

    await waitForComponent(page, 'immediate-component');

    const startTime = Date.now();
    const ready = await getProperty<boolean>(page, 'immediate-component', 'ready', {
      timeout: 5000,
      interval: 100
    });
    const elapsed = Date.now() - startTime;

    expect(ready).toBe(true);
    // Should return quickly, not wait for timeout
    expect(elapsed).toBeLessThan(1000);
  });

  test('getProperty with setProperty should wait for async property updates', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class AsyncUpdateComponent extends HTMLElement {
            constructor() {
              super();
              this._message = undefined;
            }

            connectedCallback() {
              this.innerHTML = '<div id="output">Waiting...</div>';
            }

            set message(value) {
              // Simulate async processing
              setTimeout(() => {
                this._message = value.toUpperCase();
                this.querySelector('#output').textContent = this._message;
              }, 200);
            }

            get message() {
              return this._message;
            }
          }
          customElements.define('async-update-component', AsyncUpdateComponent);
        `}</script>
        <async-update-component></async-update-component>
      </div>
    );

    await waitForComponent(page, 'async-update-component');

    // Set property (will update async)
    await setProperty(page, 'async-update-component', 'message', 'hello world');

    // Wait for the async update to complete
    const message = await getProperty<string>(page, 'async-update-component', 'message', {
      timeout: 1000,
      interval: 50
    });

    expect(message).toBe('HELLO WORLD');
  });
});
