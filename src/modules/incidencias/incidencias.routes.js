const express = require('express');

const router = express.Router();

const controller = require('./incidencias.controller');

const validator = require('./incidencias.validator');

const authCiudadano =
    require('../ciudadanos/middleware/ciudadano.auth.middleware');

const auth =
    require('../auth/middleware/auth.middleware');



// =====================================
// CIUDADANO
// =====================================

// Registrar incidencia
router.post(

    '/',

    authCiudadano,

    validator.validateCreate,

    controller.create

);


// Mis incidencias
router.get(

    '/mis-incidencias',

    authCiudadano,

    controller.findByCitizen

);


// =====================================
// Corregir incidencia observada
// Ciudadano
// =====================================

router.patch(

    '/:id/corregir',

    authCiudadano,

    controller.correctIncident

);


// =====================================
// OPERADOR MUNICIPAL
// =====================================

// Incidencias pendientes
router.get(

    '/pendientes/lista',

    auth,

    controller.findPending

);


// Aprobar incidencia
router.patch(

    '/:id/validar',

    auth,

    controller.validateIncident

);

// Observar incidencia

router.patch(

    '/:id/observar',

    auth,

    controller.observeIncident

);
// Rechazar incidencia
router.patch(

    '/:id/rechazar',

    auth,

    controller.rejectIncident

);



// =====================================
// CONSULTAS GENERALES
// =====================================

// Obtener incidencia por ID
router.get(

    '/:id',

    authCiudadano,

    controller.findById

);



module.exports = router;