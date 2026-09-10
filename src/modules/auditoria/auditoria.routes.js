
const express = require('express');

const router = express.Router();

const controller =
    require('./auditoria.controller');

const validator =
    require('./auditoria.validator');

const auth =
    require('../auth/middleware/auth.middleware');

const permissions =
    require('../auth/middleware/permissions.middleware');



// =====================================
// LISTAR TODAS LAS AUDITORÍAS
// =====================================

router.get(

    '/',

    auth,

    permissions('auditoria.listar'),

    validator.validateList,

    controller.findAll

);



// =====================================
// HISTORIAL DE UN REGISTRO
// =====================================

// Ejemplo:
// GET /api/auditoria/registro/tickets/14

router.get(

    '/registro/:tabla/:id',

    auth,

    permissions('auditoria.ver'),

    validator.validateId,

    controller.findByRecord

);



// =====================================
// BUSCAR AUDITORÍA POR ID
// =====================================

router.get(

    '/:id',

    auth,

    permissions('auditoria.ver'),

    validator.validateId,

    controller.findById

);



module.exports = router;
