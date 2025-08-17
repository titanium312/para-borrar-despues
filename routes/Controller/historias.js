// Archivo: routes/tuRuta.js

const { createToken } = require('./Base/toke');
const { prepararCarpetaDescarga, descargarYRenombrarConPrefijo } = require('../descargas/descargas');
const { obtenerIds, obtenerIdsPorAdmision } = require('./Base/ids');

// Prefijos NUEVA EPS (ACTUALIZADOS)
const PREFIJOS_NUEVA_EPS = {
  factura: 'FAC',
  anexo: 'ANX',
  historia: 'HAU',
  enfermeria: 'HAM',
  epicrisis: 'EPI',
  evolucion: 'HEV',
  ordenmedica: 'OPF',
  admisiones: 'ADM',
  prefacturas: 'PRE',
  // Nuevos tipos
  hoja_procedimientos: 'HAP',
  hoja_medicamentos: 'HMD',
  hoja_gastos: 'HGA',
  historia_asistencial: 'HAA',
};

// Códigos SALUD TOTAL por tipo base
const CODIGOS_SALUD_TOTAL = {
  factura: "prefacura",
  anexo: "anexoDos",
  historia: "historia",
  enfermeria: "enfermeria",
  epicrisis: "epicrisis",
  evolucion: "evolucion",
  ordenmedica: "ordenMedica",
  admisiones: "admisiones",
  prefacturas: "prefacturas",
  // Nuevos tipos
  hoja_procedimientos: "hojaProcedimientos",
  hoja_medicamentos: "hojaMedicamentos",
  hoja_gastos: "hojaGastos",
  historia_asistencial: "historiaAsistencial",
};

function obtenerNombrePorEPS(eps, nombreBase) {
  const nombresPorEPS = {
    NUEVA_EPS: {
      historia: 'HistoriaNuevaEPS',
      anexo: 'AnexoNuevaEPS',
      epicrisis: 'EpicrisisNuevaEPS',
      evolucion: 'EvolucionNuevaEPS',
      enfermeria: 'EnfermeriaNuevaEPS',
      admisiones: 'AdmisionesNuevaEPS',
      prefacturas: 'PrefacturasNuevaEPS',
      ordenmedica: 'OrdenMedicaNuevaEPS',
      hoja_procedimientos: 'HojaProcedimientosNuevaEPS',
      hoja_medicamentos: 'HojaMedicamentosNuevaEPS',
      hoja_gastos: 'HojaGastosNuevaEPS',
      historia_asistencial: 'HistoriaAsistencialNuevaEPS',
    },
    SALUD_TOTAL: {
      historia: 'HistoriaSaludTotal',
      anexo: 'AnexoSaludTotal',
      epicrisis: 'EpicrisisSaludTotal',
      evolucion: 'EvolucionSaludTotal',
      enfermeria: 'EnfermeriaSaludTotal',
      admisiones: 'AdmisionesSaludTotal',
      prefacturas: 'PrefacturasSaludTotal',
      ordenmedica: 'OrdenMedicaSaludTotal',
      hoja_procedimientos: 'HojaProcedimientosSaludTotal',
      hoja_medicamentos: 'HojaMedicamentosSaludTotal',
      hoja_gastos: 'HojaGastosSaludTotal',
      historia_asistencial: 'HistoriaAsistencialSaludTotal',
    },
    OTRA_EPS: {
      historia: 'HistoriaOtraEPS',
      anexo: 'AnexoOtraEPS',
      epicrisis: 'EpicrisisOtraEPS',
      evolucion: 'EvolucionOtraEPS',
      enfermeria: 'EnfermeriaOtraEPS',
      admisiones: 'AdmisionesOtraEPS',
      prefacturas: 'PrefacturasOtraEPS',
      ordenmedica: 'OrdenMedicaOtraEPS',
      hoja_procedimientos: 'HojaProcedimientosOtraEPS',
      hoja_medicamentos: 'HojaMedicamentosOtraEPS',
      hoja_gastos: 'HojaGastosOtraEPS',
      historia_asistencial: 'HistoriaAsistencialOtraEPS',
    },
  };
  const epsNombres = nombresPorEPS[eps] || {};
  return epsNombres[nombreBase.toLowerCase()] || nombreBase;
}

function getModulo(reportName) {
  const moduloMapping = {
    ListadoHistoriasClinicasDetallado3: 'HistoriasClinicas',
    ListadoanexoDosDetallado: 'Facturacion',
    ListadoEpicrisis: 'Asistencial',
    ListadoEvolucionDestallado: 'Asistencial',
    ListadoNotasEnfermeriaDestallado: 'Asistencial',
    ListadoAdmisionesDetallado: 'Facturacion',
    ListadoPrefacturasDetallado: 'Facturacion',
    ListadoOrdenMedicasDestallado: 'Asistencial',
    // Nuevos (Asistencial)
    ListadoAsistencialHojaAdministracionProcedimientos: 'Asistencial',
    ListadoAsistencialHojaAdministracionMedicamentos: 'Asistencial',
    ListadoAsistencialHojaGastos: 'Asistencial',
    ListadoHistoriasAsistencialesDestallado: 'Asistencial',
  };
  return moduloMapping[reportName] || 'Asistencial';
}

// === Helper: formato DD/MM/YYYY ===
function formatDateDDMMYYYY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// === Reportes con fecha fija 01/01/2023 -> HOY ===
const FECHA_FIJA_REPORTS = new Set([
  'ListadoAsistencialHojaAdministracionProcedimientos',
  'ListadoAsistencialHojaAdministracionMedicamentos',
  'ListadoAsistencialHojaGastos',
  'ListadoHistoriasAsistencialesDestallado',
]);

/*
URLs de referencia (ejemplo de estructura que inspiró estos reportes):
- Hoja de Administración de Procedimientos (idsHistorias)
- Hoja de Administración de Medicamentos (idsHistorias)
- Hoja de Gastos / Artículos (idsHistorias)
- Historia Clínica Asistencial (idHistorias, auditoria=1)
*/

// Mapeo de reportes -> nombre base + nombre de parámetro que espera el reporte
const reportMapping = [
  { param: 'idsHistorias',       report: 'ListadoHistoriasClinicasDetallado3',                nombre: 'historia'     },
  { param: 'idAnexosDos',        report: 'ListadoanexoDosDetallado',                          nombre: 'anexo'        },
  { param: 'idEgresos',          report: 'ListadoEpicrisis',                                  nombre: 'epicrisis'    },
  { param: 'idsEvoluciones',     report: 'ListadoEvolucionDestallado',                        nombre: 'evolucion'    },
  { param: 'idsNotasEnfermeria', report: 'ListadoNotasEnfermeriaDestallado',                  nombre: 'enfermeria'   },
  { param: 'idsAdmisiones',      report: 'ListadoAdmisionesDetallado',                        nombre: 'admisiones'   },
  // OJO: este reporte históricamente usa "idAdmisiones" (singular en el parámetro)
  { param: 'idAdmisiones',       report: 'ListadoPrefacturasDetallado',                       nombre: 'prefacturas'  },
  { param: 'idsOrdenMedicas',    report: 'ListadoOrdenMedicasDestallado',                     nombre: 'ordenmedica'  },

  // === Nuevos agregados (mismo orden lógico, al final) ===
  // Usan idsHistorias y requieren fechaInicial/fechaFinal fijas
  { param: 'idsHistorias',       report: 'ListadoAsistencialHojaAdministracionProcedimientos', nombre: 'hoja_procedimientos' },
  { param: 'idsHistorias',       report: 'ListadoAsistencialHojaAdministracionMedicamentos',   nombre: 'hoja_medicamentos'    },
  { param: 'idsHistorias',       report: 'ListadoAsistencialHojaGastos',                       nombre: 'hoja_gastos'          },

  // Historia Clínica Asistencial: param singular + auditoria=1
  { param: 'idHistorias',        report: 'ListadoHistoriasAsistencialesDestallado',            nombre: 'historia_asistencial' },
];

/** 
 * === FILTRADO METÓDICO POR REPORTE (no por parámetro) ===
 * Cada código (HT, HAP, etc.) ahora se traduce a reporte(s) exactos.
 */
const CODE_TO_REPORTS = {
  HT:   ['ListadoHistoriasClinicasDetallado3'],
  ANX:  ['ListadoanexoDosDetallado'],
  EPI:  ['ListadoEpicrisis'],
  EVL:  ['ListadoEvolucionDestallado'],
  ENF:  ['ListadoNotasEnfermeriaDestallado'],
  ADM:  ['ListadoAdmisionesDetallado'],
  PREF: ['ListadoPrefacturasDetallado'],
  OM:   ['ListadoOrdenMedicasDestallado'],

  // Nuevos
  HAP:  ['ListadoAsistencialHojaAdministracionProcedimientos'],
  HMD:  ['ListadoAsistencialHojaAdministracionMedicamentos'],
  HGA:  ['ListadoAsistencialHojaGastos'],
  HAA:  ['ListadoHistoriasAsistencialesDestallado'],

  // Especial
  TODO: ['*'],
};

function parseTiposParam(raw) {
  if (!raw) return new Set(['*']); // por defecto: todo
  const parts = String(raw)
    .split(/[,\s|]+/)
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  if (parts.includes('TODO')) return new Set(['*']);

  const reports = new Set();
  for (const code of parts) {
    const list = CODE_TO_REPORTS[code];
    if (Array.isArray(list)) {
      for (const rep of list) reports.add(rep);
    }
  }
  if (reports.size === 0) reports.add('*'); // fallback
  return reports;
}

function construirContextoRenombramiento(ids, { idAdmision, institucionId }) {
  const nit = ids?.nitInstitucion || 'NITDESCONOCIDO';
  const tipoId = (ids?.tipoDocumento || 'CC').toString().toUpperCase();
  const numId = (ids?.numero_documento || '0000000000').toString();

  let numeroFactura = ids?.numeroFactura || '0';
  if (Array.isArray(ids?.facturasDetalle) && idAdmision) {
    const match = ids.facturasDetalle.find(
      f => String(f.id_admision || f.admisionId || ids.id_admision) === String(idAdmision)
    );
    if (match && (match.numero_factura || match.numeroFactura)) {
      numeroFactura = String(match.numero_factura || match.numeroFactura);
    }
  }

  return {
    nit: String(nit),
    tipoId,
    numId,
    factura: String(numeroFactura),
    institucionId: Number(institucionId) || 0,
    idAdmision: Number(idAdmision) || 0,
  };
}

function resolverFacturaParaDocumento(ids, tipoDocumento, id, facturaFallback) {
  const porDoc = ids?.facturasPorDocumento;
  if (porDoc && porDoc[tipoDocumento] && porDoc[tipoDocumento][id]) {
    return String(porDoc[tipoDocumento][id]);
  }
  return String(facturaFallback || ids?.numeroFactura || '0');
}

function generarNombreArchivo(eps, tipoDocumento, ctx, options = {}) {
  const { nit, tipoId, numId } = ctx;
  const factura = options.facturaPorDoc || ctx.factura || '0';
  const id = options.id != null ? String(options.id) : '';

  if (eps === 'NUEVA_EPS') {
    const prefijo = PREFIJOS_NUEVA_EPS[tipoDocumento] || tipoDocumento.toUpperCase();
    // <Prefijo>_<NIT>_FEH<NoFactura>_<TipoDocumento><DocumentoID>.pdf
    return `${prefijo}_${nit}_FEH${factura}_${tipoId}${numId}.pdf`;
  }

  if (eps === 'SALUD_TOTAL') {
    const codigo = CODIGOS_SALUD_TOTAL[tipoDocumento] || 'soportes';
    // <NIT>_FEH_<NoFactura>_<Codigo>_1.pdf
    return `${nit}_FEH_${factura}_${codigo}_1.pdf`;
  }

  // Por defecto
  return `${tipoDocumento}-${id}.pdf`;
}

function toArray(v) { return v == null ? [] : (Array.isArray(v) ? v : [v]); }
function sanitizeSegment(s) {
  return String(s).replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim();
}

async function Hs_Anx(req, res) {
  try {
    const {
      clave,
      numeroFactura,
      numeroAdmision,
      idAdmision: idAdmisionRaw,
      institucionId,
      idUser,
      eps,
      // Selectores de documentos
      tipos,
      docs,    // alias
      tipo,    // alias
    } = req.query;

    const missingParams = [];
    if (!institucionId) missingParams.push('institucionId');
    if (!idUser) missingParams.push('idUser');
    if (!eps) missingParams.push('eps');

    // claveFinal sirve solo para búsqueda cuando no hay idAdmision ni numeroFactura
    const anyKey = clave ?? numeroFactura ?? numeroAdmision ?? idAdmisionRaw;
    if (!anyKey) missingParams.push('clave|numeroFactura|numeroAdmision|idAdmision');

    if (missingParams.length > 0) {
      return res.status(400).send(`❌ Faltan parámetros requeridos: ${missingParams.join(', ')}`);
    }

    // Parsear selector de tipos -> set de reportes exactos
    const tiposRaw = tipos ?? docs ?? tipo;
    const reportesSeleccionados = parseTiposParam(tiposRaw);

    // 1) Resolver y obtener IDs/metadatos
    const claveFinal = String(anyKey);
    let ids;

    if (idAdmisionRaw && !numeroFactura && !clave && !numeroAdmision) {
      ids = await obtenerIdsPorAdmision({
        institucionId: Number(institucionId),
        idAdmision: Number(idAdmisionRaw),
      });
    } else {
      ids = await obtenerIds({
        institucionId: Number(institucionId),
        clave: claveFinal,
      });
    }

    // Determinar la admisión resuelta
    const resolvedAdmisionId = (
      Number(ids?.id_admision) ||
      Number(idAdmisionRaw) ||
      Number(numeroAdmision) ||
      (Number.isFinite(Number(claveFinal)) ? Number(claveFinal) : 0)
    );

    // 2) Contexto de renombramiento
    const ctx = construirContextoRenombramiento(ids, {
      idAdmision: resolvedAdmisionId,
      institucionId,
    });

    // 3) Normalización
    const normalized = {
      idsHistorias:       toArray(ids.idsHistorias || ids.id_historia),
      idAnexosDos:        toArray(ids.idAnexosDos || ids.anexo2),
      idEgresos:          toArray(ids.idEgresos || ids.id_egreso),
      idsEvoluciones:     toArray(ids.idsEvoluciones || ids.evoluciones),
      idsNotasEnfermeria: toArray(ids.idsNotasEnfermeria || ids.notas_enfermeria),
      idsAdmisiones:      toArray(ids.idsAdmisiones || ids.id_admision || resolvedAdmisionId),
      idAdmisiones:       toArray(
        ids.idAdmisiones ||
        (Array.isArray(ids.facturasDetalle) && ids.facturasDetalle.length
          ? ids.facturasDetalle.map(() => resolvedAdmisionId)
          : resolvedAdmisionId)
      ),
      idsOrdenMedicas:    toArray(ids.idsOrdenMedicas || ids.ordenes_medicas),

      // Para el reporte Historia Clínica Asistencial (param singular)
      idHistorias:        toArray(ids.idHistorias || ids.id_historia),
    };

    // 4) Construir trabajos (aplicando el filtro por **reporte**)
    const trabajos = [];

    // Fechas fijas para los reportes específicos
    const FECHA_INICIAL_FIJA = '01/01/2023';
    const FECHA_FINAL_HOY = formatDateDDMMYYYY(new Date());

    for (const { param, report, nombre } of reportMapping) {
      // 🔐 Nuevo filtro: por nombre de **reporte** exacto
      if (!(reportesSeleccionados.has('*') || reportesSeleccionados.has(report))) continue;

      const lista = normalized[param];
      if (!lista || lista.length === 0) continue;

      const modulo = getModulo(report);
      const nombreEPS = obtenerNombrePorEPS(eps, nombre);

      for (const id of lista) {
        const token = createToken(report, Number(institucionId), 83, Number(idUser));
        const urlParams = new URLSearchParams({
          modulo,
          reporte: report,
          render: 'pdf',
          hideTool: 'true',
          environment: '1',
          userId: String(idUser),
          [param]: String(id),
          token,
        });

        // 👉 Agregar fechas SOLO para los reportes con fecha fija
        if (FECHA_FIJA_REPORTS.has(report)) {
          urlParams.set('fechaInicial', FECHA_INICIAL_FIJA);
          urlParams.set('fechaFinal', FECHA_FINAL_HOY);
        }

        // 👉 auditoria=1 SOLO para Historia Clínica Asistencial
        if (report === 'ListadoHistoriasAsistencialesDestallado') {
          urlParams.set('auditoria', '1');
        }

        const facturaPorDoc = resolverFacturaParaDocumento(ids, nombre, String(id), ctx.factura);
        const nombreArchivoFinal = generarNombreArchivo(eps, nombre, ctx, { id, facturaPorDoc });

        trabajos.push({
          url: `https://reportes.saludplus.co/view.aspx?${urlParams.toString()}`,
          nombreArchivo: nombreArchivoFinal,
          nombreInterno: nombreEPS,
          reporte: report,
          id,
          param, // debug
        });
      }
    }

    if (trabajos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron IDs/documentos para los tipos solicitados.',
      });
    }

    // 5) Preparar carpeta (CREAR si no existe; si existe, NO borrar)

    // 🔧 CAMBIO: decidir explícitamente etiqueta de carpeta según parámetros recibidos
    // Regla:
    // - si viene numeroFactura => "factura-<numeroFactura>"
    // - else si viene numeroAdmision o idAdmision => "admision-<numeroAdmision|idAdmision>"
    // - else (solo clave) => "admision-<resolvedAdmisionId>" (fallback seguro)
    let etiquetaCarpeta;
    if (numeroFactura) {
      etiquetaCarpeta = `factura-${sanitizeSegment(numeroFactura)}`;
    } else if (numeroAdmision || idAdmisionRaw) {
      etiquetaCarpeta = `admision-${sanitizeSegment(numeroAdmision || idAdmisionRaw)}`;
    } else {
      etiquetaCarpeta = `admision-${sanitizeSegment(resolvedAdmisionId)}`;
    }

    // 🔧 CAMBIO: preferFacturaNum ya NO se infiere de la clave;
    // solo se usa el numeroFactura explícito cuando venga.
    const preferFacturaNum = numeroFactura ?? undefined;

    const fixedDir = prepararCarpetaDescarga(
      String(idUser),
      { etiquetaCarpeta, factura: preferFacturaNum, idAdmision: resolvedAdmisionId },
      { clean: false } // NO limpiar si ya existe
    );

    // 6) Descargar a esa carpeta fija
    const resultados = [];
    for (const job of trabajos) {
      try {
        const rutaGuardada = await descargarYRenombrarConPrefijo(
          job.nombreArchivo,
          job.url,
          String(resolvedAdmisionId),
          String(idUser),
          { fixedDir }
        );

        resultados.push({
          id: job.id,
          reporte: job.reporte,
          param: job.param,
          ruta: rutaGuardada,
          nombreArchivo: job.nombreArchivo,
          status: 'success',
        });
      } catch (err) {
        resultados.push({
          id: job.id,
          reporte: job.reporte,
          param: job.param,
          error: err.message,
          nombreArchivo: job.nombreArchivo,
          status: 'error',
        });
      }
    }

    return res.json({
      success: resultados.every((r) => r.status === 'success'),
      message: resultados.some((r) => r.status === 'error')
        ? 'Algunos archivos no se pudieron descargar'
        : '✅ Todos los archivos descargados correctamente',
      resultados,
      metadata: {
        carpeta: fixedDir,
        etiqueta: etiquetaCarpeta,
        carpetaAdmision: String(resolvedAdmisionId),
        eps,
        filtros: {
          tipos: tiposRaw || 'TODO',
          // ahora mostramos qué reportes se aplicaron realmente
          reportesAplicados: Array.from(reportesSeleccionados),
        },
        total: resultados.length,
        exitosos: resultados.filter((r) => r.status === 'success').length,
        fallidos: resultados.filter((r) => r.status === 'error').length,
        renombramiento: {
          nit: ctx.nit,
          tipoId: ctx.tipoId,
          numId: ctx.numId,
          facturaPorDefecto: ctx.factura,
        },
        entrada: {
          clave: claveFinal,
          numeroFactura: numeroFactura ?? null,
          numeroAdmision: numeroAdmision ?? null,
          idAdmision: idAdmisionRaw ?? null,
        },
        fechasFijasAplicadasA: Array.from(FECHA_FIJA_REPORTS),
        fechaInicialFija: FECHA_INICIAL_FIJA,
        fechaFinalHoy: FECHA_FINAL_HOY,
      },
    });
  } catch (error) {
    console.error('🔥 Error en Hs_Anx:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      detalle: error.message,
    });
  }
}

module.exports = { Hs_Anx };
