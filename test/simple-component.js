/**
 * Simple Web Component for testing complex property passing
 */
class SimpleComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const data = this.getData();

    this.shadowRoot.innerHTML = `
      <div class="component">
        <h3>Simple Component</h3>
        <div class="data-display">
          <p>String: <span id="string-data">${data.string || 'none'}</span></p>
          <p>Number: <span id="number-data">${data.number || 'none'}</span></p>
          <p>Array Length: <span id="array-data">${data.array?.length || 0}</span></p>
          <p>Object Keys: <span id="object-data">${data.object ? Object.keys(data.object).length : 0}</span></p>
          <p>Function: <span id="function-data">${data.function ? 'present' : 'none'}</span></p>
        </div>
      </div>
    `;
  }

  getData() {
    // Try to get data from various sources
    const stringData = this.getAttribute('data-string');
    const numberData = this.getAttribute('data-number');

    // Try to get complex data from properties (not attributes)
    const arrayData = this._arrayProp;
    const objectData = this._objectProp;
    const functionData = this._functionProp;

    return {
      string: stringData,
      number: numberData ? parseInt(numberData) : null,
      array: arrayData,
      object: objectData,
      function: functionData
    };
  }

  set arrayProp(value) {
    this._arrayProp = value;
    this.render();
  }

  set objectProp(value) {
    this._objectProp = value;
    this.render();
  }

  set functionProp(value) {
    this._functionProp = value;
    this.render();
  }
}

customElements.define('simple-component', SimpleComponent);
