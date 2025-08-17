// Archivo: descargarArchivo.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { pipeline } = require('stream/promises');

// ⬇️ Importa ambas APIs: la unificada (clave = admisión o factura) y la clásica
const { obtenerIds, obtenerIdsPorAdmision } = require('./Base/ids');

function sanitizeFilename(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarEPS(eps) {
  const e = String(eps || '').trim().toUpperCase();
  if (e === 'NUEVA EPS' || e === 'NUEVA_EPS') return 'NUEVA EPS';
  if (e === 'SALUD TOTAL' || e === 'SALUD_TOTAL') return 'SALUD TOTAL';
  return e;
}

// util: toma la factura principal (mayor id_factura) o una que coincida con el número indicado
function pickFactura(facturasDetalle = [], preferNumeroFactura = null) {
  if (!Array.isArray(facturasDetalle) || facturasDetalle.length === 0) return null;

  if (preferNumeroFactura) {
    const match = facturasDetalle.find(
      f => String(f.numero_factura) === String(preferNumeroFactura)
    );
    if (match) return match;
  }

  // Heurística robusta: mayor id_factura
  return facturasDetalle.reduce(
    (acc, cur) => (!acc || Number(cur.id_factura) > Number(acc.id_factura) ? cur : acc),
    null
  );
}

// Si ya existe un archivo con ese nombre, genera "name (1).ext", "name (2).ext", ...
function getAvailablePath(basePath) {
  if (!fs.existsSync(basePath)) return basePath;
  const dir = path.dirname(basePath);
  const ext = path.extname(basePath);
  const name = path.basename(basePath, ext);
  let i = 1;
  let candidate;
  do {
    candidate = path.join(dir, `${name} (${i})${ext}`);
    i += 1;
  } while (fs.existsSync(candidate));
  return candidate;
}

async function descargarArchivo(req, res) {
  try {
    const {
      // claves posibles de entrada
      clave,             // puede ser número/ID de admisión o número de factura
      numeroFactura,     // alternativa específica
      numeroAdmision,    // alternativa específica
      idAdmision,        // alternativa específica
      // requeridos
      eps,
      institucionId,
      idUser,
    } = req.query;

    // Validación de requeridos
    const faltantes = [];
    if (!eps) faltantes.push('eps');
    if (!institucionId) faltantes.push('institucionId');
    if (!idUser) faltantes.push('idUser');

    // Debe existir al menos una clave: clave | numeroFactura | numeroAdmision | idAdmision
    const anyKey = clave ?? numeroFactura ?? numeroAdmision ?? idAdmision;
    if (!anyKey) faltantes.push('clave|numeroFactura|numeroAdmision|idAdmision');

    if (faltantes.length > 0) {
      return res
        .status(400)
        .send(`❌ Faltan parámetros obligatorios: ${faltantes.join(', ')}`);
    }

    // 0) Resolver IDs y metadatos usando la API adecuada
    let ids;
    if (idAdmision && !clave && !numeroFactura && !numeroAdmision) {
      // Camino explícito por admisión (compatibilidad con la versión anterior)
      try {
        ids = await obtenerIdsPorAdmision({
          institucionId: Number(institucionId),
          idAdmision: Number(idAdmision),
        });
      } catch (e) {
        console.error('No se pudieron obtener IDs por admisión:', e);
        return res.status(400).send('❌ No se encontraron datos para la admisión indicada');
      }
    } else {
      // Camino unificado: clave puede ser factura o admisión
      const claveFinal = String(anyKey);
      try {
        ids = await obtenerIds({
          institucionId: Number(institucionId),
          clave: claveFinal,
        });
      } catch (e) {
        console.error('No se pudieron obtener IDs por clave:', e);
        return res.status(400).send('❌ No se encontraron datos para la clave indicada');
      }
    }

    // 1) Determinar números "visibles" (los que irán en el nombre de la carpeta)
    const numeroAdmisionVisible =
      (numeroAdmision != null && String(numeroAdmision).trim() !== '')
        ? String(numeroAdmision).trim()
        : (ids?.numeroAdmision ?? ids?.numero_admision ?? null) // por si la API lo trae
          ?? (/^\d+$/.test(String(clave || '')) ? String(clave).trim() : null); // si clave fue numérica y corresponde a admisión

    const numeroFacturaVisible =
      (numeroFactura != null && String(numeroFactura).trim() !== '')
        ? String(numeroFactura).trim()
        : (ids?.numeroFactura ?? null)                               // por si la API lo trae
          ?? (Array.isArray(ids?.facturasDetalle) && ids.facturasDetalle[0]?.numero_factura
                ? String(ids.facturasDetalle[0].numero_factura)
                : null)
          ?? ((!numeroAdmision && clave) ? String(clave).trim() : null); // si la clave venía y no hubo numeroAdmision

    // 2) (opcional) conservar la admisión resuelta solo para metadatos, NO para el nombre de carpeta
    const resolvedAdmisionId =
      Number(ids?.id_admision) ||
      (Number.isFinite(Number(idAdmision)) ? Number(idAdmision) : 0) ||
      (Number.isFinite(Number(numeroAdmision)) ? Number(numeroAdmision) : 0) ||
      (Number.isFinite(Number(clave)) ? Number(clave) : 0);

    // 3) Elegir la factura principal priorizando coincidencia con el número indicado
    const preferFacturaNum =
      (numeroFactura != null && String(numeroFactura).trim() !== '')
        ? String(numeroFactura).trim()
        : (clave && !/^\d+$/.test(String(clave))) ? String(clave) : null;

    const principal = pickFactura(ids.facturasDetalle, preferFacturaNum);

    if (!principal?.id_factura) {
      return res
        .status(404)
        .send('❌ No se encontraron facturas asociadas a la admisión/clave indicada');
    }

    const idFactura = String(principal.id_factura);
    const noFactura =
      preferFacturaNum ??
      ids?.numeroFactura ??
      principal.numero_factura ??
      idFactura;

    const nit = ids?.nitInstitucion ? String(ids.nitInstitucion) : 'NITDESCONOCIDO';
    const tipoDoc = (ids?.tipoDocumento || 'CC').toString().toUpperCase();
    const numDoc = (ids?.numero_documento || '0000000000').toString();

    // 4) Carpeta: descargas/idUser/<factura-XXXX | admision-YYYY> usando los NÚMEROS visibles exactamente como llegan
    let folderKey;
    if (numeroFactura != null && String(numeroFactura).trim() !== '') {
      folderKey = `factura-${sanitizeFilename(String(numeroFactura).trim())}`;
    } else if (numeroAdmision != null && String(numeroAdmision).trim() !== '') {
      folderKey = `admision-${sanitizeFilename(String(numeroAdmision).trim())}`;
    } else if (numeroFacturaVisible) {
      folderKey = `factura-${sanitizeFilename(numeroFacturaVisible)}`;
    } else if (numeroAdmisionVisible) {
      folderKey = `admision-${sanitizeFilename(numeroAdmisionVisible)}`;
    } else if (clave) {
      // último recurso: usar la clave tal cual para no perder trazabilidad
      folderKey = `clave-${sanitizeFilename(String(clave))}`;
    } else {
      folderKey = 'admision-desconocida';
    }

    const downloadDir = path.resolve(
      __dirname,
      `../descargas/descarga/${sanitizeFilename(String(idUser))}/${folderKey}`
    );
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    // ⚠️ A PARTIR DE AQUÍ: NO ELIMINAMOS NADA EN ESA CARPETA

    // 5) Llamar servicio externo para obtener URL del ZIP
    const zipInfoUrl = `https://server-01.saludplus.co/facturasAdministar/GetZipFile?IdFactura=${encodeURIComponent(
      idFactura
    )}`;
    const response = await axios.get(zipInfoUrl);

    if (response.data?.valorRetorno !== 1) {
      return res.status(400).send('❌ Error al obtener la información de la factura');
    }

    const archivoUrl = response.data.archivo;
    if (!archivoUrl) {
      return res.status(400).send('❌ No se encontró la URL del archivo en la respuesta');
    }

    // 6) Descargar ZIP temporal
    const zipTmpName = `tmp_${idFactura}.zip`;
    const zipPath = path.join(downloadDir, zipTmpName);
    const zipResp = await axios.get(archivoUrl, { responseType: 'stream' });
    await pipeline(zipResp.data, fs.createWriteStream(zipPath));

    // 7) Abrir ZIP y localizar el primer PDF
    const directory = await unzipper.Open.file(zipPath);
    const pdfEntry = directory.files.find((f) => /\.pdf$/i.test(f.path));
    if (!pdfEntry) {
      try { fs.unlinkSync(zipPath); } catch {}
      return res.status(400).send('❌ El ZIP no contiene ningún PDF');
    }

    // 8) Nombre FINAL según EPS
    const epsNorm = normalizarEPS(eps);
    let baseNombreFinal;

    if (epsNorm === 'NUEVA EPS') {
      // FVS_{NIT}_FEH{NoFactura}_{TipoDoc}{NumDoc}.pdf
      baseNombreFinal = `FVS_${nit}_FEH${noFactura}_${tipoDoc}${numDoc}`;
    } else if (epsNorm === 'SALUD TOTAL') {
      // {NIT}_FEH_{NoFactura}_1_1.pdf
      baseNombreFinal = `${nit}_FEH_${noFactura}_1_1`;
    } else {
      // Genérico
      baseNombreFinal = `${nit}_${noFactura}`;
    }

    const finalSafe = sanitizeFilename(baseNombreFinal);
    // Si existe, no lo borres: crea un nombre alterno "(1)", "(2)", ...
    const pdfOutputPath = getAvailablePath(path.join(downloadDir, `${finalSafe}.pdf`));

    // 9) Extraer el PDF con el nombre final
    await pipeline(pdfEntry.stream(), fs.createWriteStream(pdfOutputPath));

    // 10) Limpieza mínima: solo borra el ZIP temporal (✅ seguro)
    try { fs.unlinkSync(zipPath); } catch {}

    return res.json({
      mensaje: '✅ PDF extraído y renombrado correctamente',
      archivoPDF: pdfOutputPath,
      nombrePDF: path.basename(pdfOutputPath),
      eps: epsNorm,
      entrada: {
        clave: clave ?? null,
        numeroFactura: numeroFactura ?? null,
        numeroAdmision: numeroAdmision ?? null,
        idAdmision: idAdmision ?? null,
      },
      numerosVisibles: {
        numeroAdmision: numeroAdmisionVisible || null,
        numeroFactura: numeroFacturaVisible || null,
      },
      carpetaUsada: folderKey,
      computedFrom: {
        idFactura,
        noFactura: String(noFactura),
        nit,
        tipoDoc,
        numDoc,
        admisionResuelta: resolvedAdmisionId || null,
        carpeta: downloadDir,
        etiquetaCarpeta: folderKey,
      },
    });
  } catch (error) {
    console.error('🔥 Error descargando/extrayendo PDF:', error);
    return res.status(500).send('❌ Error interno al descargar o extraer el PDF');
  }
}

module.exports = { descargarArchivo };
