const express = require('express');
const router = express.Router();

// Import controller functions
const { Hs_Anx } = require('./Controller/historias');
const { descargarArchivo } = require('./Controller/facuraelectronica');
const { procesarAdmisiones } = require('./Controller/Base/consultaid');
const { obtenerDatosLogin } = require('./Controller/Base/toke');
const { descargarCarpeta } = require('./descargas/rar');
const { EliminarCarpeta } = require('./descargas/delete');
// area de gereadorde url pdf
router.get('/Hs_Anx', Hs_Anx);
router.get('/facturaElectronica', descargarArchivo);


//area de cosultas
router.post('/api/admisiones', procesarAdmisiones);
router.post('/api/istitucion', obtenerDatosLogin);

// descargar 
router.get('/descargar-zip', descargarCarpeta);
router.get('/eliminar-carpeta', EliminarCarpeta);
// Route to test server
router.get('/router', (req, res) => {
  res.send('Hola Mundo'); // Send a response to the client
});

module.exports = router;
