import { LitElement, html, css } from 'lit';
import { when } from 'lit/directives/when.js';
import './boton/boton.js';
import styles from './EstiloAdmiciones.js';
import { BASE_URL } from '../api.js'; // ✅ de aquí tomamos la URL base


export class AdmicionesArchivos extends LitElement {
  static properties = {
    loginData: { type: Object },
    tipoBusqueda: { type: String, reflect: true },
    numeros: { type: String },
    tiposSeleccionados: { type: Array },
    eps: { type: String, reflect: true },
    incluirFactura: { type: Boolean, reflect: true },
    apiDocsUrl: { type: String, attribute: 'api-docs-url' },
    apiFacturaUrl: { type: String, attribute: 'api-factura-url' },
    concurrency: { type: Number },

    // State internos
    _descargando: { type: Boolean, state: true },
    _error: { type: String, state: true },
    _progreso: { type: Number, state: true },
    _etiquetaProgreso: { type: String, state: true },
    _idsProcesados: { type: Number, state: true },
    _idsTotales: { type: Number, state: true },
    _archivosDescargados: { type: Array, state: true },
    _aborter: { state: true },
  };

  /* =========================
   *  🧩 CSS — ORGANIZADO
   * ========================= */
  static styles = [
    styles,
    // Pequeño ajuste: evita que los botones parezcan deshabilitados en macOS con aria-pressed
    css`
      .docTypes__btn[aria-pressed="true"] { outline: none; }
    `,
  ];

  constructor() {
    super();
    // Defaults
    this.loginData = null;
    this.tipoBusqueda = 'numeroAdmision';
    this.numeros = '';
    this.tiposSeleccionados = [];
    this.eps = 'NUEVA_EPS';
    this.incluirFactura = false;
    this.concurrency = 3;

    // ✅ Endpoints ahora derivados de BASE_URL (sobrescribibles por atributos)
    this.apiDocsUrl = `${BASE_URL}/hs_anx`;
    this.apiFacturaUrl = `${BASE_URL}/facturaElectronica`;

    // State
    this._descargando = false;
    this._error = '';
    this._progreso = 0;
    this._etiquetaProgreso = '';
    this._idsProcesados = 0;
    this._idsTotales = 0;
    this._archivosDescargados = [];
    this._aborter = null;

    // Tipos disponibles (sin íconos)
    this._tiposDisponibles = [
      { code: 'HT',   label: 'Historia Clínica' },
      { code: 'ANX',  label: 'Anexo 2' },
      { code: 'EPI',  label: 'Epicrisis' },
      { code: 'EVL',  label: 'Evolución' },
      { code: 'ENF',  label: 'Enfermería' },
      { code: 'ADM',  label: 'Admisiones' },
      { code: 'PREF', label: 'Prefacturas' },
      { code: 'OM',   label: 'Órdenes Médicas' },
      { code: 'HAP',  label: 'Hoja Adm. Procedimientos' },
      { code: 'HMD',  label: 'Hoja Adm. Medicamentos' },
      { code: 'HGA',  label: 'Hoja de Gastos/Artículos' },
      { code: 'HAA',  label: 'Historia Clínica Asistencial' },
      { code: 'TODO', label: 'Todos los tipos' },
    ];

    // Atajo de teclado
    this.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        this.descargarArchivos();
      }
    });
  }

  /*** Utils ***/
  _toast(msg, kind = 'success') {
    const wrap = this.renderRoot?.querySelector('.c-toasts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `c-toast --${kind}`;
    el.role = 'status';
    el.ariaLive = 'polite';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  _debug(msg, payload, kind = 'log') { try { console[kind]?.(msg, payload); } catch (_) {} }

  _parseIds(raw) {
    return Array.from(new Set(
      (raw || '')
        .split(/[\n,;\t\s]+/)
        .map((x) => x.trim())
        .filter(Boolean)
    ));
  }

  _validarCampos() {
    const { usuario, institucion } = this.loginData || {};
    const idUser = usuario?.id_usuario;
    const institucionId = institucion?.id_institucion;
    const ids = this._parseIds(this.numeros);
    this._error = '';

    if (!idUser || !institucionId) {
      this._error = 'Faltan datos de sesión. Verifique usuario e institución.';
      return null;
    }
    if (ids.length === 0) {
      this._error = 'Ingrese al menos un número (separados por coma o saltos de línea).';
      return null;
    }
    if (this.tiposSeleccionados.length === 0) {
      this._error = 'Seleccione al menos un tipo (o marque TODO).';
      return null;
    }
    return { ids, idUser, institucionId };
  }

  toggleTipo(tipo) {
    if (tipo === 'TODO') {
      this.tiposSeleccionados = this.tiposSeleccionados.includes('TODO') ? [] : ['TODO'];
      return;
    }
    const sinTODO = this.tiposSeleccionados.filter((t) => t !== 'TODO');
    this.tiposSeleccionados = sinTODO.includes(tipo)
      ? sinTODO.filter((t) => t !== tipo)
      : [...sinTODO, tipo];
  }

  // Botón de tipo sin ícono; texto centrado; estado persistente con aria-pressed
  _chip(t) {
    const pressed = this.tiposSeleccionados.includes(t.code);
    return html`
      <button
        type="button"
        class="docTypes__btn"
        aria-pressed=${pressed}
        @click=${() => this.toggleTipo(t.code)}
        title=${t.label}
      >
        ${t.label}
      </button>
    `;
  }

  _armarURLDocs(base, { id, institucionId, idUser, eps, tipo }) {
    const url = new URL(base);
    url.searchParams.append(this.tipoBusqueda, id);
    url.searchParams.append('institucionId', institucionId);
    url.searchParams.append('idUser', idUser);
    url.searchParams.append('eps', eps);
    url.searchParams.append('tipos', tipo);
    return url.toString();
  }

  _armarURLFactura(base, { id, institucionId, idUser, eps }) {
    const url = new URL(base);
    url.searchParams.append(this.tipoBusqueda, id);
    url.searchParams.append('institucionId', institucionId);
    url.searchParams.append('idUser', idUser);
    url.searchParams.append('eps', eps);
    return url.toString();
  }

  async _fetchSafe(u, controller) {
    try {
      const res = await fetch(u, { signal: controller?.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (e?.name === 'AbortError') throw e;
      throw new Error(`Fallo solicitando ${u}: ${e?.message || e}`);
    }
  }

  async _descargarDocsParaId(id, ctx, controller) {
    const { institucionId, idUser } = ctx;
    const base = this.apiDocsUrl; // ✅ usa el valor derivado de BASE_URL por defecto (o el atributo si viene)

    if (this.tiposSeleccionados.includes('TODO')) {
      const u = this._armarURLDocs(base, { id, institucionId, idUser, eps: this.eps, tipo: 'TODO' });
      try {
        await this._fetchSafe(u, controller);
        this._pushArchivo({ id, tipo: 'TODO', nombre: `Documentos_${id}_TODO.pdf` });
      } catch (e) {
        this._debug('Error al descargar (TODO)', e, 'error');
        this._toast(`Error con ${id} (TODO)`, 'error');
      }
      return;
    }

    await Promise.all(
      this.tiposSeleccionados.map(async (tipo) => {
        const u = this._armarURLDocs(base, { id, institucionId, idUser, eps: this.eps, tipo });
        try {
          await this._fetchSafe(u, controller);
          this._pushArchivo({ id, tipo, nombre: `Documentos_${id}_${tipo}.pdf` });
        } catch (e) {
          this._debug(`Error al descargar ${tipo}`, e, 'error');
          this._toast(`Error con ${id} (${tipo})`, 'error');
        }
      })
    );
  }

  async _descargarFacturaParaId(id, ctx, controller) {
    if (!this.incluirFactura) return;
    const { institucionId, idUser } = ctx;
    const u = this._armarURLFactura(this.apiFacturaUrl, { id, institucionId, idUser, eps: this.eps });
    try {
      await this._fetchSafe(u, controller);
      this._pushArchivo({ id, tipo: 'FACTURA', nombre: `Factura_${id}.pdf` });
    } catch (e) {
      this._debug('Error al descargar factura', e, 'error');
      this._toast(`Error con factura ${id}`, 'error');
    }
  }

  _pushArchivo({ id, tipo, nombre }) {
    this._archivosDescargados = [
      ...this._archivosDescargados,
      {
        id,
        tipo,
        nombre,
        tamano: 'Solicitado',
        timestamp: new Date().toLocaleTimeString(),
      },
    ];
  }

  async _procesarId(id, ctx, controller) {
    this._etiquetaProgreso = `Descargando archivos para ${id}…`;
    await this._descargarDocsParaId(id, ctx, controller);
    await this._descargarFacturaParaId(id, ctx, controller);

    const boton = this.renderRoot?.querySelector('boton-componente');
    if (boton?.refresh instanceof Function) {
      try { await boton.refresh(); } catch (e) { this._debug('refresh() falló en boton-componente', e, 'warn'); }
    }

    this.dispatchEvent(new CustomEvent('descargas-completadas', { bubbles: true, composed: true, detail: { id } }));
  }

  /** Cola con concurrencia limitada **/
  async _runQueue(items, worker, concurrency = 3) {
    const queue = [...items];
    const running = new Set();

    const runNext = async () => {
      if (!queue.length) return;
      const item = queue.shift();
      const p = (async () => worker(item))()
        .catch((e) => this._debug('worker error', e, 'error'))
        .finally(() => running.delete(p));
      running.add(p);
      if (running.size >= concurrency) await Promise.race(running);
      return runNext();
    };

    await runNext();
    await Promise.allSettled([...running]);
  }

  async descargarArchivos() {
    if (this._descargando) return;

    const val = this._validarCampos();
    if (!val) {
      if (this._error) this._toast(this._error, 'error');
      return;
    }

    const { ids, idUser, institucionId } = val;
    this._aborter = new AbortController();

    this._descargando = true;
    this._progreso = 0;
    this._idsProcesados = 0;
    this._idsTotales = ids.length;
    this._etiquetaProgreso = 'Preparando descargas…';
    this._archivosDescargados = [];

    const ctx = { idUser, institucionId };

    try {
      await this._runQueue(
        ids,
        async (id) => {
          await this._procesarId(id, ctx, this._aborter);
          this._idsProcesados += 1;
          this._progreso = this._idsProcesados / this._idsTotales;
          await new Promise((r) => setTimeout(r, 60));
        },
        Math.max(1, Number(this.concurrency) || 1)
      );

      this._toast('¡Todas las descargas se solicitaron correctamente!', 'success');
      this._etiquetaProgreso = '✅ Descarga completada';
    } catch (e) {
      if (e?.name === 'AbortError') {
        this._toast('Descarga cancelada', 'warning');
        this._etiquetaProgreso = '⏹️ Descarga cancelada';
      } else {
        this._toast('Error durante la descarga', 'error');
        this._debug('Error global en descargas', e, 'error');
        this._etiquetaProgreso = '❌ Error en la descarga';
      }
    } finally {
      this._descargando = false;
      this._aborter = null;
    }
  }

  cancelarDescargas() {
    if (this._aborter) {
      this._aborter.abort();
      this._aborter = null;
    }
  }

  limpiarFormulario() {
    this.tiposSeleccionados = [];
    this.numeros = '';
    this._archivosDescargados = [];
    this._error = '';
    this._progreso = 0;
    this._etiquetaProgreso = '';
    this._toast('Formulario limpio', 'success');
  }

  /*** Render ***/
  _renderArchivoDescargado(archivo) {
    return html`
      <div class="c-fileItem" role="listitem">
        <div class="c-fileItem__icon" aria-hidden="true">${archivo.tipo}</div>
        <div class="c-fileItem__info">
          <div class="c-fileItem__name">${archivo.nombre}</div>
          <div class="c-fileItem__meta">ID: ${archivo.id} • ${archivo.timestamp}</div>
        </div>
      </div>
    `;
  }

  render() {
    const epsOptions = ['NUEVA_EPS', 'SALUD_TOTAL', 'OTRA_EPS'];
    const progressPercent = Math.round((this._progreso || 0) * 100);
    const sesionValida = Boolean(this.loginData?.usuario?.id_usuario && this.loginData?.institucion?.id_institucion);

    return html`
      <div class="l-container">
        <div class="c-header" role="region" aria-label="Encabezado">
          <h1 class="c-header__title">📄 Descarga de Archivos</h1>
          <p class="c-header__subtitle">Una interfaz moderna para descargar documentos médicos rápido y sin fricción</p>
          <p class="c-header__subtitle" style="margin-top:8px;">
            Tip: pulsa <kbd class="c-kbd">Ctrl/⌘ + Enter</kbd> para iniciar.
          </p>
        </div>

        <!-- Configuración -->
        <div class="c-card" role="form" aria-labelledby="config-title">
          <h2 id="config-title" class="c-sectionTitle">⚙️ Configuración de Descarga</h2>

          <div class="c-field">
            <label class="c-label" for="tipo-busqueda">🔍 Tipo de búsqueda</label>
            <select id="tipo-busqueda" class="c-select" .value=${this.tipoBusqueda} @change=${(e) => (this.tipoBusqueda = e.target.value)}>
              <option value="numeroAdmision">🏥 Número de Admisión</option>
              <option value="numeroFactura">🧾 Número de Factura</option>
            </select>
          </div>

          <div class="c-field">
            <label class="c-label" for="numeros">📋 Números a procesar</label>
            <textarea
              id="numeros"
              class="c-textarea"
              .value=${this.numeros}
              @input=${(e) => (this.numeros = e.target.value)}
              placeholder="Ejemplo:\n12345, 67890\n98765\n11223"></textarea>
            <div class="c-help">💡 Separa los números con comas, espacios o nuevas líneas. ¡Puedes pegar directamente desde Excel!</div>
            ${when(this._error && this._error.includes('Ingrese'), () => html`<div class="c-help --danger">⚠️ ${this._error}</div>`)}
          </div>

          <div class="c-field">
            <span class="c-label">📑 Tipos de documento a descargar</span>
            <div class="docTypes" role="group" aria-label="Tipos de documento">
              ${this._tiposDisponibles.map((t) => this._chip(t))}
            </div>
            <div class="c-help">🎯 Selecciona <strong>Todos los tipos</strong> para descargar todo de una vez, o elige específicos.</div>
            ${when(this._error && this._error.includes('Seleccione'), () => html`<div class="c-help --danger">⚠️ ${this._error}</div>`)}
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="c-field">
              <label class="c-label" for="eps">🏢 EPS</label>
              <select id="eps" class="c-select" .value=${this.eps} @change=${(e) => (this.eps = e.target.value)}>
                ${epsOptions.map((eps) => html`<option value=${eps}>${eps}</option>`)}
              </select>
            </div>
            <div class="c-field">
              <label class="c-switch" for="factura">
                <input id="factura" type="checkbox" .checked=${this.incluirFactura} @change=${(e) => (this.incluirFactura = e.target.checked)} />
                <span>💰 Incluir Factura Electrónica</span>
              </label>
            </div>
          </div>

          <div class="c-actions">
            <button class="c-btn --secondary" ?disabled=${this._descargando} @click=${this.limpiarFormulario}>🗑️ Limpiar</button>
            ${when(!this._descargando, () => html`
              <button class="c-btn --primary" @click=${this.descargarArchivos} ?disabled=${!sesionValida}>📥 Iniciar Descarga</button>
            `)}
            ${when(this._descargando, () => html`
              <button class="c-btn --danger" @click=${this.cancelarDescargas}>⏹️ Cancelar</button>
            `)}
          </div>

          ${when(this._error && !this._error.includes('Ingrese') && !this._error.includes('Seleccione'), () => html`<div class="c-help --danger" style="margin-top: 12px;">⚠️ ${this._error}</div>`)}
        </div>

        <!-- DOS SECCIONES EN PARALELO -->
        <div class="l-grid-main">
          <!-- Izquierda: Estado -->
          <div class="c-card" role="status" aria-live="polite">
            <h2 class="c-sectionTitle">📊 Estado de Descarga</h2>

            <div class="c-progress">
              <div class="c-progress__head">
                <div class="c-progress__title">${this._descargando ? '⏳ Procesando…' : this._progreso === 1 ? '✅ Completado' : '⏸️ Listo'}</div>
                ${when(this._idsTotales, () => html`<div class="c-progress__stats">${this._idsProcesados}/${this._idsTotales} (${progressPercent}%)</div>`)}
              </div>
              <div class="c-progress__bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${progressPercent} role="progressbar">
                <div class="c-progress__fill" style="width:${progressPercent}%"></div>
              </div>
              <div class="c-progress__label">${this._etiquetaProgreso || '🎯 Configura y presiona “Iniciar Descarga”'}</div>
            </div>

            ${when(this._archivosDescargados.length > 0, () => html`
              <div style="margin-top: 16px;">
                <h3 style="margin:0 0 10px; font-size: 1rem;" class="u-muted">📦 Archivos Solicitados (${this._archivosDescargados.length})</h3>
                <div class="c-filesList" role="list">
                  ${this._archivosDescargados.map((a) => this._renderArchivoDescargado(a))}
                </div>
              </div>
            `)}
          </div>

          <!-- Derecha: Herramientas / Alerta -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="c-card">
              <h2 class="c-sectionTitle">🛠️ Herramientas Adicionales</h2>
              <div style="background: var(--color-bg-soft); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <boton-componente .loginData=${this.loginData}></boton-componente>
              </div>
              <div class="c-help" style="margin-top: 10px;">💡 Administra carpetas y crea ZIP de las descargas.</div>
            </div>

            ${when(!this.loginData, () => html`
              <div class="c-card" style="background: var(--color-warning); color: white;">
                <h3 style="margin: 0 0 8px 0;">⚠️ Sin Datos de Sesión</h3>
                <p style="margin: 0; font-size: .9rem;">No se detectaron datos de usuario. Verifica tu sesión antes de descargar.</p>
              </div>
            `)}
          </div>
        </div>

        <!-- Consejos -->
        <div class="c-card" style="margin-top: 28px; background: linear-gradient(135deg, var(--color-bg-soft), #e0f2fe);">
          <h2 class="c-sectionTitle">💡 Consejos de Uso</h2>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 10px;">
            <div style="display:flex; gap:10px; align-items:flex-start;">
              <div style="background: var(--color-accent-600); color:white; width: 28px; height:28px; display:grid; place-items:center; border-radius: 50%; font-weight:700;">1</div>
              <div><strong>Prepara tus números</strong><br /><span class="c-help">Pega desde Excel o separa con comas</span></div>
            </div>
            <div style="display:flex; gap:10px; align-items:flex-start;">
              <div style="background: var(--color-success); color:white; width: 28px; height:28px; display:grid; place-items:center; border-radius: 50%; font-weight:700;">2</div>
              <div><strong>Elige tipos</strong><br /><span class="c-help">Usa “Todos los tipos” para traer todo de una vez</span></div>
            </div>
            <div style="display:flex; gap:10px; align-items:flex-start;">
              <div style="background: var(--color-warning); color:white; width: 28px; height:28px; display:grid; place-items:center; border-radius: 50%; font-weight:700;">3</div>
              <div><strong>Monitorea</strong><br /><span class="c-help">Elimina la carpeta si quieres una descarga limpia</span></div>
            </div>
          </div>
        </div>

        <div class="c-toasts" aria-live="polite" aria-atomic="true"></div>
        <slot name="extras"></slot>
      </div>
    `;
  }
}

customElements.define('admiciones-archivos', AdmicionesArchivos);
