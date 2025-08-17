// Archivo: descargas/descargas.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

function sanitizeSegment(s) {
  return String(s).replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim();
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function emptyDir(p) {
  if (!fs.existsSync(p)) return;
  for (const f of fs.readdirSync(p)) {
    const full = path.join(p, f);
    try {
      const st = fs.statSync(full);
      if (st.isDirectory()) fs.rmSync(full, { recursive: true, force: true });
      else fs.rmSync(full, { force: true });
    } catch {}
  }
}

/**
 * Devuelve una ruta de archivo única evitando sobrescribir.
 * Si existe "name.ext", genera "name (1).ext", "name (2).ext", ...
 */
function uniquePath(dir, filename) {
  const safe = sanitizeSegment(filename);
  const ext = path.extname(safe);
  const base = path.basename(safe, ext) || 'archivo';
  let candidate = path.join(dir, safe);
  let i = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base} (${i})${ext}`);
    i += 1;
  }
  return candidate;
}

/**
 * Prepara la carpeta raíz de descarga:
 * base: <este_directorio>/descarga/<idUser>/<etiquetaCarpeta>
 * - Si no existe, la crea.
 * - Si clean=true, la vacía.
 * - Si clean=false, no borra nada (solo asegura existencia).
 *
 * @param {string} idUser
 * @param {{ etiquetaCarpeta?: string, factura?: string|number, idAdmision?: string|number }} meta
 * @param {{ clean?: boolean }} options
 * @returns {string} ruta absoluta de la carpeta preparada
 */
function prepararCarpetaDescarga(idUser, meta = {}, options = {}) {
  const { clean = false } = options;
  const root = path.resolve(__dirname, 'descarga', sanitizeSegment(String(idUser || 'user')));
  ensureDir(root);

  let etiqueta = meta.etiquetaCarpeta;
  if (!etiqueta) {
    if (meta.factura != null && meta.factura !== '') {
      etiqueta = `factura-${sanitizeSegment(String(meta.factura))}`;
    } else if (meta.idAdmision != null && meta.idAdmision !== '') {
      etiqueta = `admision-${sanitizeSegment(String(meta.idAdmision))}`;
    } else {
      etiqueta = 'misc';
    }
  }

  const dir = path.join(root, sanitizeSegment(etiqueta));
  ensureDir(dir);

  if (clean) emptyDir(dir);

  return dir;
}

/**
 * Descarga un archivo desde URL y lo guarda con "nombreArchivo" dentro de:
 * - options.fixedDir (si se provee) o
 * - <este_directorio>/descarga/<idUser>/admision-<idAdmision>
 *
 * No sobrescribe: si existe, crea " (1)", " (2)", ...
 *
 * @param {string} nombreArchivo
 * @param {string} url
 * @param {string|number} idAdmision
 * @param {string|number} idUser
 * @param {{ fixedDir?: string, overwrite?: boolean, timeoutMs?: number }} options
 * @returns {Promise<string>} ruta absoluta del archivo guardado
 */
async function descargarYRenombrarConPrefijo(
  nombreArchivo,
  url,
  idAdmision,
  idUser,
  options = {}
) {
  const { fixedDir, overwrite = false, timeoutMs = 0 } = options;

  const baseDir =
    fixedDir ||
    prepararCarpetaDescarga(String(idUser), { idAdmision: idAdmision ?? 'desconocida' }, { clean: false });

  ensureDir(baseDir);

  const safeName = sanitizeSegment(nombreArchivo || 'archivo.pdf');
  const targetPath = overwrite
    ? path.join(baseDir, safeName)
    : uniquePath(baseDir, safeName);

  // Descargamos primero a un temporal y luego movemos
  const tmpPath = `${targetPath}.part`;

  const resp = await axios.get(url, {
    responseType: 'stream',
    timeout: timeoutMs > 0 ? timeoutMs : 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(tmpPath);
    resp.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  // Renombrar el temporal al definitivo
  fs.renameSync(tmpPath, targetPath);
  return targetPath;
}

module.exports = {
  prepararCarpetaDescarga,
  descargarYRenombrarConPrefijo,
};
