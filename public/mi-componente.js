import { LitElement, html, css } from 'lit';

class MiComponente extends LitElement {

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--mi-componente-text-color, black);
    }
  `;

  render() {
    return html`
      <div>
        <h1>Hola Mundo</h1>
      </div>
    `;
  }
}

customElements.define('mi-componente', MiComponente);



/*

import { LitElement, html } from 'lit';

class MiComponente extends LitElement {
  static properties = {
    loginData: { type: Object },
  };

  constructor() {
    super();
    this.loginData = {
      usuario: {
        id_usuario: 0,
        nombre: '',
      },
    };
  }

  render() {
    const { usuario } = this.loginData || {};
    return html`
      <div>
        <p><strong>ID Usuario:</strong> ${usuario?.id_usuario ?? '—'}</p>
        <p><strong>Nombre:</strong> ${usuario?.nombre ?? '—'}</p>
      </div>
    `;
  }
}

customElements.define('boton-componente', MiComponente); */