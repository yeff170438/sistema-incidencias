const express = require('express');

const router = express.Router();

const controller =
    require('./asignaciones.controller');

const auth =
    require('../auth/middleware/auth.middleware');

const permissions =
    require('../auth/middleware/permissions.middleware');


// =====================================
// CONSULTAS
// =====================================

// =====================================
// Listar asignaciones por oficina
// =====================================

router.get(

    '/oficina/:id_oficina',

    auth,

    permissions('tickets.ver'),

    controller.findByOffice

);


// =====================================
// Listar asignaciones pendientes
// por oficina
// =====================================

router.get(

    '/pendientes/:id_oficina',

    auth,

    permissions('tickets.atender'),

    controller.getPendingAssignments

);


// =====================================
// CREAR ASIGNACIÓN POR DERIVACIÓN
// =====================================

router.post(

    '/derivacion',

    auth,

    permissions('tickets.derivar'),

    controller.createFromDerivation

);


// =====================================
// CREAR ASIGNACIÓN MANUAL
// =====================================

router.post(

    '/',

    auth,

    permissions('tickets.asignar'),

    controller.create

);


// =====================================
// OBTENER ASIGNACIÓN POR ID
// =====================================

router.get(

    '/:id',

    auth,

    permissions('tickets.ver'),

    controller.findById

);


// =====================================
// FLUJO DE ASIGNACIÓN
// =====================================


// =====================================
// Recibir asignación
//
// Pendiente de recepción
//          ↓
//       Recibida
// =====================================

router.patch(

    '/:id/recibir',

    auth,

    permissions('tickets.atender'),

    controller.receive

);


// =====================================
// Rechazar asignación
//
// Pendiente de recepción
//          ↓
//      Rechazada
// =====================================

router.patch(

    '/:id/rechazar',

    auth,

    permissions('tickets.derivar'),

    controller.reject

);


// =====================================
// Iniciar atención
//
// Recibida
//     ↓
// En proceso
// =====================================

router.patch(

    '/:id/iniciar',

    auth,

    permissions('tickets.atender'),

    controller.start

);


// =====================================
// Finalizar atención
//
// En proceso
//     ↓
// Finalizada
// =====================================

router.patch(

    '/:id/finalizar',

    auth,

    permissions('tickets.atender'),

    controller.finish

);


module.exports = router;