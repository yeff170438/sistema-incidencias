const express = require('express');

const router = express.Router();


// =====================================
// CONTROLLER
// =====================================

const controller =
    require('./comunicaciones.controller');


// =====================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================

const auth =
    require('../auth/middleware/auth.middleware');


// =====================================
// MIDDLEWARE DE PERMISOS
// =====================================

const permissions =
    require('../auth/middleware/permissions.middleware');


// =====================================
// VALIDATORS
// =====================================

const validator =
    require('./comunicaciones.validator');


// =====================================
// CREAR COMUNICACIÓN
// =====================================

router.post(

    '/',

    auth,

    permissions('comunicaciones.crear'),

    validator.validateCreateCommunication,

    controller.create

);


// =====================================
// LISTAR COMUNICACIONES DE UN TICKET
// =====================================

router.get(

    '/ticket/:id',

    auth,

    permissions('comunicaciones.ver'),

    validator.validateTicketId,

    controller.findByTicket

);


// =====================================
// BUSCAR COMUNICACIÓN POR ID
// =====================================

router.get(

    '/:id',

    auth,

    permissions('comunicaciones.ver'),

    validator.validateCommunicationId,

    controller.findById

);


// =====================================
// LISTAR TODAS LAS COMUNICACIONES
// =====================================

router.get(

    '/',

    auth,

    permissions('comunicaciones.ver'),

    controller.findAll

);


// =====================================
// EXPORTAR
// =====================================

module.exports = router;