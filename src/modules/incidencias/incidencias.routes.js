const express = require('express');
const router = express.Router();

const controller = require('./incidencias.controller');
const validator = require('./incidencias.validator');

const authCiudadano = require(
    '../ciudadanos/middleware/ciudadano.auth.middleware'
);

const auth = require('../auth/middleware/auth.middleware');

const authorizePermission = require(
    '../auth/middleware/permissions.middleware'
);

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

// Consultar mis incidencias
router.get(
    '/mis-incidencias',
    authCiudadano,
    controller.findByCitizen
);

// Corregir incidencia observada
// Exclusivo del ciudadano propietario
router.patch(
    '/:id/corregir',
    authCiudadano,
    controller.correctIncident
);

// =====================================
// ADMIN / OPERADOR
// =====================================

// Listar todas las incidencias
router.get(
    '/gestion',
    auth,
    authorizePermission('incidencias.listar'),
    controller.findForManagement
);

// Consultar incidencias pendientes
router.get(
    '/pendientes/lista',
    auth,
    authorizePermission('incidencias.listar'),
    controller.findPending
);

// Validar incidencia
router.patch(
    '/:id/validar',
    auth,
    authorizePermission('incidencias.validar'),
    controller.validateIncident
);

// Observar incidencia
router.patch(
    '/:id/observar',
    auth,
    authorizePermission('incidencias.observar'),
    controller.observeIncident
);

// Rechazar incidencia
router.patch(
    '/:id/rechazar',
    auth,
    authorizePermission('incidencias.rechazar'),
    controller.rejectIncident
);

// =====================================
// CONSULTA POR ID
// =====================================

// El controlador verifica que la incidencia
// pertenezca al ciudadano autenticado.
router.get(
    '/:id',
    authCiudadano,
    controller.findById
);

 // Editar incidencia administrativamente
 // Requiere el permiso incidencias.editar
router.patch(
    '/:id/editar',
    auth,
    authorizePermission('incidencias.editar'),
    validator.validateAdminEdit,
    controller.adminEditIncident
);
router.get(
    '/gestion/ciudadano/:id',
    auth,
    authorizePermission('incidencias.listar'),
    controller.findByCitizenAdmin
);
module.exports = router;