// controllers/descarga-rapida-estable.controller.js
"use strict";

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const os = require("os");
const archiver = require("archiver");
const { pipeline, Transform } = require("stream");
const crypto = require("crypto");

// ======================= Config =======================
const BASE_DIR = process.env.DESCARGA_BASE_DIR || path.join(__dirname, "descarga");
// Carpeta donde se guardan los ZIPs cacheados (persisten entre requests)
const CACHE_DIR = process.env.ZIP_CACHE_DIR || path.join(os.tmpdir(), "zip-cache");
// TTL del ZIP en caché (ms). Si quieres que no expire por tiempo, pon 0.
const CACHE_TTL_MS = Number(process.env.ZIP_CACHE_TTL_MS || 24 * 60 * 60 * 1000); // 24h
// Límite opcional de velocidad (bytes/seg). 0 = sin límite.
// Útil para que proxies/ISP no corten por ráfagas muy grandes.
const MAX_RATE_BPS = Number(process.env.ZIP_MAX_RATE_BPS || 16 * 1024 * 1024); // ~16 MB/s

// ====================== Utilidades ======================
async function ensureDir(p) {
  try { await fsp.mkdir(p, { recursive: true }); } catch (_) {}
}

async function dirMTimeMs(dir) {
  // mtime "agregado": cambia si cambia algo dentro
  const stDir = await fsp.stat(dir);
  let max = stDir.mtimeMs;
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    const st = await fsp.stat(p);
    if (st.mtimeMs > max) max = st.mtimeMs;
  }
  return max;
}

function weakETagFromStats(st) {
  return `W/"${st.size}-${Math.floor(st.mtimeMs)}"`;
}

function sanitizeName(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Throttle simple (token-bucket)
function throttle(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) {
    // Passthrough
    return new Transform({
      transform(chunk, enc, cb) { this.push(chunk); cb(); }
    });
  }
  let allowance = bytesPerSec;
  let last = Date.now();
  return new Transform({
    transform(chunk, enc, cb) {
      const now = Date.now();
      allowance += ((now - last) / 1000) * bytesPerSec;
      if (allowance > bytesPerSec) allowance = bytesPerSec;
      last = now;

      const send = () => { this.push(chunk); cb(); };

      if (chunk.length <= allowance) {
        allowance -= chunk.length;
        send();
      } else {
        const waitMs = Math.ceil(((chunk.length - allowance) / bytesPerSec) * 1000);
        allowance = 0;
        setTimeout(send, waitMs);
      }
    }
  });
}

// ================== Construcción y caché de ZIP ==================
async function crearZip(origenDir, zipDestPath) {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipDestPath);
    const archive = archiver("zip", { zlib: { level: 0 } }); // sin compresión (más estable/rápido)

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("warning", (e) => console.warn("Archiver warning:", e));
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(origenDir, false); // sin subcarpeta raíz
    archive.finalize();
  });
}

async function getOrBuildZip(origenDir, nombreSalidaVisible) {
  await ensureDir(CACHE_DIR);

  // clave depende de ruta + mtime agregado del origen
  const origenMtime = await dirMTimeMs(origenDir);
  const key = crypto.createHash("sha1").update(origenDir + "|" + origenMtime).digest("hex");

  const zipPath = path.join(CACHE_DIR, `${sanitizeName(nombreSalidaVisible)}.${key}.zip`);

  try {
    const st = await fsp.stat(zipPath);
    const age = Date.now() - st.mtimeMs;
    if (!CACHE_TTL_MS || age < CACHE_TTL_MS) {
      // reutiliza el ZIP estable
      return zipPath;
    }
  } catch (_) {
    // no existe o no reutilizable → se crea
  }

  await crearZip(origenDir, zipPath);
  return zipPath;
}

// ================== Servidor de archivos con Range ==================
function servirConRangeEstable(req, res, filePath, fileName) {
  const st = fs.statSync(filePath);
  const total = st.size;
  const lastModified = new Date(st.mtimeMs).toUTCString();
  const etag = weakETagFromStats(st);

  // Headers de estabilidad/anti-transformaciones
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("Last-Modified", lastModified);
  res.setHeader("ETag", etag);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=75");

  // If-Range: si el cliente presenta If-Range y NO coincide, ignoramos Range
  const ifRange = req.headers["if-range"];
  const ifRangeIsValid =
    !ifRange ||
    ifRange === etag ||
    (new Date(ifRange).toString() !== "Invalid Date" && new Date(ifRange).getTime() >= st.mtimeMs);

  // Soporte Range
  let start = 0;
  let end = total - 1;

  const range = req.headers.range;
  if (range && ifRangeIsValid) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      if (m[1]) start = parseInt(m[1], 10);
      if (m[2]) end = parseInt(m[2], 10);
    }
    if (
      Number.isNaN(start) || Number.isNaN(end) ||
      start < 0 || end >= total || start > end
    ) {
      res.status(416).setHeader("Content-Range", `bytes */${total}`).end();
      return;
    }
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
    res.setHeader("Content-Length", String(end - start + 1));
  } else {
    res.status(200);
    res.setHeader("Content-Length", String(total));
  }

  // Socket robusto
  try { req.socket.setKeepAlive(true); } catch (_) {}
  try { req.socket.setTimeout(0); } catch (_) {}
  try { req.socket.setNoDelay(true); } catch (_) {}

  res.flushHeaders?.();

  const rs = fs.createReadStream(filePath, { start, end, highWaterMark: 1024 * 1024 }); // 1MB
  const t = throttle(MAX_RATE_BPS);

  const onDone = (err) => { if (err) console.error("Pipeline error:", err); };
  pipeline(rs, t, res, onDone);

  res.on("close", () => rs.destroy());
}

// ================== Controller principal ==================
async function descargarCarpeta(req, res) {
  try {
    const nombreCarpeta = req.query.carpeta;
    if (!nombreCarpeta) {
      return res.status(400).send("Debe especificar el nombre de la carpeta a descargar (query ?carpeta=...).");
    }
    if (nombreCarpeta.includes("..") || path.isAbsolute(nombreCarpeta)) {
      return res.status(400).send("Nombre de carpeta inválido.");
    }

    const carpetaPath = path.join(BASE_DIR, nombreCarpeta);
    if (!fs.existsSync(carpetaPath) || !fs.statSync(carpetaPath).isDirectory()) {
      return res.status(404).send("La carpeta especificada no existe.");
    }

    const zipFileName = `${sanitizeName(nombreCarpeta)}.zip`;
    // ZIP estable en caché (no se borra al terminar; se rota por TTL o cambios)
    const zipPath = await getOrBuildZip(carpetaPath, zipFileName);

    // Sirve con soporte Range/If-Range y headers de estabilidad
    servirConRangeEstable(req, res, zipPath, zipFileName);
  } catch (error) {
    console.error("Error en descargarCarpeta:", error);
    if (!res.headersSent) res.status(500).send("Error interno del servidor.");
  }
}

module.exports = { descargarCarpeta };

/*
====================== Uso con Express ======================
const express = require("express");
const { descargarCarpeta } = require("./controllers/descarga-rapida-estable.controller");
const app = express();

app.get("/descargar", descargarCarpeta);

// Recomendado en tu server real (si usas Node HTTP nativo):
const server = app.listen(process.env.PORT || 3000, () => console.log("OK"));
// Evita timeouts de requests largos:
server.requestTimeout = 0;
server.headersTimeout = 0;
server.keepAliveTimeout = 75_000;

================= Si hay un Nginx delante (ejemplo) ================
proxy_request_buffering off;
proxy_buffering off;
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
sendfile on;
tcp_nodelay on;
keepalive_timeout 75s;

===============================================================
*/
