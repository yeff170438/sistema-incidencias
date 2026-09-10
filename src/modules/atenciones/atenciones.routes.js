const express = require('express');

const router = express.Router();

const controller =
    require('./atenciones.controller');

const validator =
    require('./atenciones.validator');

const auth =
    require('../auth/middleware/auth.middleware');

const permissions =
    require('../auth/middleware/permissions.middleware');



// =====================================
// FLUJO DE ATENCIÓN
// =====================================


// =====================================
// Iniciar atención
// =====================================
//
// Asignación:
// Recibida
//     ↓
// En proceso
//
// Ticket:
// Asignado
//     ↓
// En Atención
// =====================================

router.post(

    '/',

    auth,

    permissions('atenciones.iniciar'),

    validator.startAttention,

    controller.startAttention

);



// =====================================
// Registrar avances
// =====================================
//
// En proceso
//     ↓
// Actualización de información
// =====================================

router.patch(

    '/:id_atencion',

    auth,

    permissions('atenciones.actualizar'),

    validator.updateProgress,

    controller.updateProgress

);



// =====================================
// Finalizar atención
// =====================================
//
// Atención:
// En proceso
//     ↓
// Finalizada
//
// Ticket:
// En Atención
//     ↓
// Resuelto
// =====================================

router.patch(

    '/:id_atencion/finalizar',

    auth,

    permissions('atenciones.finalizar'),

    validator.finishAttention,

    controller.finishAttention

);



// =====================================
// Derivar atención
// =====================================
//
// Atención actual
//     ↓
// Derivación
//     ↓
// Finalización de atención actual
//     ↓
// Nueva asignación
//     ↓
// Pendiente de recepción
// =====================================

router.post(

    '/:id_atencion/derivar',

    auth,

    permissions('atenciones.derivar'),

    validator.deriveAttention,

    controller.deriveAttention

);



// =====================================
// Finalizar atención por derivación
// =====================================
//
// La atención actual se cierra
// porque el ticket continuará
// mediante una nueva asignación.
// =====================================

router.patch(

    '/:id_atencion/finalizar-derivacion',

    auth,

    permissions('atenciones.derivar'),

    validator.finishAttentionByDerivation,

    controller.finishAttentionByDerivation

);



// =====================================
// CONSULTAS
// =====================================


// =====================================
// Buscar atención por ID
// =====================================

router.get(

    '/:id_atencion',

    auth,

    permissions('atenciones.ver'),

    controller.findById

);



// =====================================
// Historial de atenciones del ticket
// =====================================

router.get(

    '/ticket/:id_ticket',

    auth,

    permissions('atenciones.ver'),

    controller.findByTicket

);



module.exports = router;