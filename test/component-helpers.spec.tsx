import { test, expect, setProperty, call, getProperty, spyOn, emit, getFunctionCalls, waitForComponent, waitForEvent } from '../src/index.js';

test.describe('Component Helper Tests', () => {
  test('setProperty should set string property', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class PropertyComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div id="output"></div>';
            }
            set message(value) {
              this._message = value;
              this.querySelector('#output').textContent = value;
            }
            get message() {
              return this._message;
            }
          }
          customElements.define('property-component', PropertyComponent);
        `}</script>
        <property-component></property-component>
      </div>
    );

    await waitForComponent(page, 'property-component');
    await setProperty(page, 'property-component', 'message', 'Hello World');

    const output = page.locator('#output');
    await expect(output).toHaveText('Hello World');
  });

  test('setProperty should set object property', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class DataComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div id="data-output"></div>';
            }
            set data(value) {
              this._data = value;
              this.querySelector('#data-output').textContent = JSON.stringify(value);
            }
          }
          customElements.define('data-component', DataComponent);
        `}</script>
        <data-component></data-component>
      </div>
    );

    await waitForComponent(page, 'data-component');
    await setProperty(page, 'data-component', 'data', { name: 'Test', count: 42 });

    const output = page.locator('#data-output');
    await expect(output).toContainText('"name":"Test"');
    await expect(output).toContainText('"count":42');
  });

  test('setProperty should set array property', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class ListComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div id="list-output"></div>';
            }
            set items(value) {
              this._items = value;
              this.querySelector('#list-output').textContent = 'Items: ' + value.length;
            }
          }
          customElements.define('list-component', ListComponent);
        `}</script>
        <list-component></list-component>
      </div>
    );

    await waitForComponent(page, 'list-component');
    await setProperty(page, 'list-component', 'items', ['a', 'b', 'c', 'd']);

    const output = page.locator('#list-output');
    await expect(output).toHaveText('Items: 4');
  });

  test('setProperty should handle callback function and track calls', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class CallbackComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<button id="trigger">Trigger</button>';
              this.querySelector('#trigger').addEventListener('click', () => {
                if (this.onClick) {
                  this.onClick('clicked', { timestamp: Date.now() });
                }
              });
            }
          }
          customElements.define('callback-component', CallbackComponent);
        `}</script>
        <callback-component></callback-component>
      </div>
    );

    await waitForComponent(page, 'callback-component');

    // Set callback function - it will be automatically tracked
    await setProperty(page, 'callback-component', 'onClick', () => {});

    // Verify no calls yet
    let calls = await getFunctionCalls(page, 'callback-component', 'onClick');
    expect(calls).toHaveLength(0);

    // Trigger the callback
    await page.click('#trigger');
    await page.waitForTimeout(50);

    // Verify callback was called
    calls = await getFunctionCalls(page, 'callback-component', 'onClick');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.args?.[0]).toBe('clicked');
  });

  test('call should invoke method on component', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class MethodComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div id="result">0</div>';
            }
            add(a, b) {
              const result = a + b;
              this.querySelector('#result').textContent = result;
              return result;
            }
            multiply(a, b) {
              return a * b;
            }
          }
          customElements.define('method-component', MethodComponent);
        `}</script>
        <method-component></method-component>
      </div>
    );

    await waitForComponent(page, 'method-component');

    // Call method and get return value
    const result = await call<number>(page, 'method-component', 'add', 10, 20);
    expect(result).toBe(30);

    // Verify DOM was updated
    const output = page.locator('#result');
    await expect(output).toHaveText('30');

    // Call another method
    const product = await call<number>(page, 'method-component', 'multiply', 5, 6);
    expect(product).toBe(30);
  });

  test('getProperty should retrieve property value', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class StateComponent extends HTMLElement {
            constructor() {
              super();
              this._count = 0;
            }
            connectedCallback() {
              this.innerHTML = '<button id="inc">Increment</button>';
              this.querySelector('#inc').addEventListener('click', () => {
                this._count++;
              });
            }
            get count() {
              return this._count;
            }
          }
          customElements.define('state-component', StateComponent);
        `}</script>
        <state-component></state-component>
      </div>
    );

    await waitForComponent(page, 'state-component');

    // Get initial value
    let count = await getProperty<number>(page, 'state-component', 'count');
    expect(count).toBe(0);

    // Click button
    await page.click('#inc');
    await page.waitForTimeout(50);

    // Get updated value
    count = await getProperty<number>(page, 'state-component', 'count');
    expect(count).toBe(1);
  });

  test('spyOn should capture custom events', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class EventComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<button id="emit-btn">Emit Event</button>';
              this.querySelector('#emit-btn').addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('custom-event', {
                  detail: { message: 'Hello from component', value: 42 },
                  bubbles: true
                }));
              });
            }
          }
          customElements.define('event-component', EventComponent);
        `}</script>
        <event-component></event-component>
      </div>
    );

    await waitForComponent(page, 'event-component');

    // Start spying on events
    const getEvents = await spyOn(page, 'event-component', 'custom-event');

    // No events yet
    let events = await getEvents();
    expect(events).toHaveLength(0);

    // Trigger event
    await page.click('#emit-btn');
    await page.waitForTimeout(50);

    // Verify event was captured
    events = await getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('custom-event');
    expect(events[0]?.detail).toEqual({ message: 'Hello from component', value: 42 });
    expect(events[0]?.bubbles).toBe(true);
  });

  test('emit should dispatch custom event to component', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class ListenerComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div id="received">No event</div>';
              this.addEventListener('data-received', (e) => {
                this.querySelector('#received').textContent =
                  'Received: ' + JSON.stringify(e.detail);
              });
            }
          }
          customElements.define('listener-component', ListenerComponent);
        `}</script>
        <listener-component></listener-component>
      </div>
    );

    await waitForComponent(page, 'listener-component');

    // Emit event to component
    await emit(page, 'listener-component', 'data-received', { value: 'test data', count: 5 });
    await page.waitForTimeout(50);

    // Verify component received and processed the event
    const output = page.locator('#received');
    await expect(output).toContainText('"value":"test data"');
    await expect(output).toContainText('"count":5');
  });

  test('waitForEvent should wait for event emission', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class DelayedEventComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<div>Component loaded</div>';
              // Emit event after delay
              setTimeout(() => {
                this.dispatchEvent(new CustomEvent('ready', {
                  detail: { status: 'initialized' }
                }));
              }, 100);
            }
          }
          customElements.define('delayed-event-component', DelayedEventComponent);
        `}</script>
        <delayed-event-component></delayed-event-component>
      </div>
    );

    await waitForComponent(page, 'delayed-event-component');

    // Wait for the event
    const event = await waitForEvent(page, 'delayed-event-component', 'ready');

    expect(event.type).toBe('ready');
    expect(event.detail).toEqual({ status: 'initialized' });
  });

  test('multiple callbacks should be tracked independently', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class MultiCallbackComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <button id="btn1">Button 1</button>
                <button id="btn2">Button 2</button>
              \`;
              this.querySelector('#btn1').addEventListener('click', () => {
                if (this.onClickOne) this.onClickOne('one');
              });
              this.querySelector('#btn2').addEventListener('click', () => {
                if (this.onClickTwo) this.onClickTwo('two');
              });
            }
          }
          customElements.define('multi-callback-component', MultiCallbackComponent);
        `}</script>
        <multi-callback-component></multi-callback-component>
      </div>
    );

    await waitForComponent(page, 'multi-callback-component');

    // Set two different callbacks
    await setProperty(page, 'multi-callback-component', 'onClickOne', () => {});
    await setProperty(page, 'multi-callback-component', 'onClickTwo', () => {});

    // Trigger first callback
    await page.click('#btn1');
    await page.waitForTimeout(50);

    let calls1 = await getFunctionCalls(page, 'multi-callback-component', 'onClickOne');
    let calls2 = await getFunctionCalls(page, 'multi-callback-component', 'onClickTwo');
    expect(calls1).toHaveLength(1);
    expect(calls2).toHaveLength(0);

    // Trigger second callback
    await page.click('#btn2');
    await page.waitForTimeout(50);

    calls1 = await getFunctionCalls(page, 'multi-callback-component', 'onClickOne');
    calls2 = await getFunctionCalls(page, 'multi-callback-component', 'onClickTwo');
    expect(calls1).toHaveLength(1);
    expect(calls2).toHaveLength(1);
    expect(calls2[0]?.args?.[0]).toBe('two');
  });

  test('spyOn should track multiple events', async ({ render, page }) => {
    await render(
      <div>
        <script type="module">{`
          class MultiEventComponent extends HTMLElement {
            connectedCallback() {
              this.innerHTML = '<button id="trigger">Trigger</button>';
              this.querySelector('#trigger').addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('click-event', { detail: { count: 1 } }));
              });
            }
          }
          customElements.define('multi-event-component', MultiEventComponent);
        `}</script>
        <multi-event-component></multi-event-component>
      </div>
    );

    await waitForComponent(page, 'multi-event-component');

    const getEvents = await spyOn(page, 'multi-event-component', 'click-event');

    // Trigger multiple times
    await page.click('#trigger');
    await page.click('#trigger');
    await page.click('#trigger');
    await page.waitForTimeout(50);

    const events = await getEvents();
    expect(events).toHaveLength(3);
  });
});
