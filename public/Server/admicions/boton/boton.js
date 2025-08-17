import { LitElement, html } from 'lit';
import styles from './botonEstilo.js';
import { BASE_URL } from '../../api.js'; // ✅ de aquí toma la URL base

class MiComponente extends LitElement {
  static properties = {
    loginData: { type: Object },
    carpetaExiste: { type: Boolean },
    isDeleting: { type: Boolean },
    isDownloading: { type: Boolean }
  };

  static styles = styles;

  constructor() {
    super();
    this.loginData = {
      usuario: {
        id_usuario: 0,
        nombre: '',
      },
    };
    this.carpetaExiste = false;
    this.isDeleting = false;
    this.isDownloading = false;
  }

  async refresh() {
    await this.verificarCarpeta();
  }

  connectedCallback() {
    super.connectedCallback();
    this._onDescargaCompletada = () => this.refresh();
    this.addEventListener('descargas-completadas', this._onDescargaCompletada);
  }

  disconnectedCallback() {
    this.removeEventListener('descargas-completadas', this._onDescargaCompletada);
    super.disconnectedCallback();
  }

  updated(changedProps) {
    if (changedProps.has('loginData')) {
      this.verificarCarpeta();
    }
  }

  async verificarCarpeta() {
    const id = this.loginData?.usuario?.id_usuario;
    if (!id) {
      this.carpetaExiste = false;
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/eliminar-carpeta?nombreCarpeta=${id}`);
      const texto = await res.text();
      this.carpetaExiste = texto.includes('❌ Para eliminar la carpeta');
    } catch (error) {
      console.error('Error al verificar carpeta:', error);
      this.carpetaExiste = false;
    }
  }

  async eliminarCarpeta() {
    if (this.isDeleting) return;
    
    const id = this.loginData?.usuario?.id_usuario;
    if (!id) return;
    
    this.isDeleting = true;
    
    try {
      const res = await fetch(`${BASE_URL}/eliminar-carpeta?nombreCarpeta=${id}&confirmacion=si`);
      const data = await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(data.mensaje || 'Carpeta eliminada');
      await this.refresh();
    } catch (error) {
      console.error('Error al eliminar carpeta:', error);
    } finally {
      this.isDeleting = false;
    }
  }

  async descargarZip() {
    if (this.isDownloading) return;
    
    this.isDownloading = true;
    const id = this.loginData?.usuario?.id_usuario;
    const nombre = this.loginData?.usuario?.nombre?.replace(/\s+/g, '_').toLowerCase() || 'cliente';
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const link = document.createElement('a');
      link.href = `${BASE_URL}/descargar-zip?carpeta=${id}`;
      link.download = `${nombre}_${id}.zip`;
      link.click();
    } catch (error) {
      console.error('Error al descargar ZIP:', error);
    } finally {
      this.isDownloading = false;
    }
  }

  render() {
    return html`
      <div class="container">
        ${this.carpetaExiste
          ? html`
              <button 
                class="delete-btn ${this.isDeleting ? 'deleting' : ''}"
                @click=${this.eliminarCarpeta}
                ?disabled=${this.isDeleting}
              >
                ${this.isDeleting 
                  ? html`<span class="spinner"></span> Eliminando...`
                  : html`<span class="icon">🗑️</span> Eliminar carpeta`}
              </button>
              
              <button 
                class="download-btn ${this.isDownloading ? 'downloading' : ''}"
                @click=${this.descargarZip}
                ?disabled=${this.isDownloading}
              >
                ${this.isDownloading 
                  ? html`<span class="spinner"></span> Preparando...`
                  : html`<span class="icon">⬇️</span> Descargar ZIP`}
              </button>
            `
          : html`<p class="message"><span>📂</span> No se encontró carpeta asociada.</p>`}
      </div>
    `;
  }
}

customElements.define('boton-componente', MiComponente);
