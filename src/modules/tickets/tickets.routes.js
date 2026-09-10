const express = require('express');

const router = express.Router();


const controller =
    require('./tickets.controller');


// Middleware autenticación operador
const auth =
    require('../auth/middleware/auth.middleware');




// =====================================
// CREAR TICKET
// =====================================
// Se ejecuta después de validar una incidencia
// =====================================

router.post(

    '/incidencia',

    auth,

    controller.createFromIncident

);




// =====================================
// SELECCIONAR MODALIDAD DE ATENCIÓN
// =====================================
// El operador decide cómo será atendido
// el ticket.
//
// ATENCION_DIRECTA
// SOLICITUD_ADMINISTRATIVA
// =====================================

router.patch(

    '/:id/modalidad',

    auth,

    controller.selectAttentionMode

);




// =====================================
// CONSULTAS
// =====================================


// Obtener ticket por ID

router.get(

    '/:id',

    auth,

    controller.findById

);




// Listar tickets

router.get(

    '/',

    auth,

    controller.findAll

);




// =====================================
// FLUJO DEL TICKET
// =====================================


// =====================================
// Asignar ticket
// Estado:
// Asignado
// =====================================

router.patch(

    '/:id/asignar',

    auth,

    controller.assignTicket

);




// =====================================
// Iniciar atención
// Estado:
// En Atención
// =====================================

router.patch(

    '/:id/iniciar-atencion',

    auth,

    controller.startAttention

);




// =====================================
// Resolver ticket
// Estado:
// Resuelto
// =====================================

router.patch(

    '/:id/resolver',

    auth,

    controller.resolveTicket

);




// =====================================
// Cerrar ticket
// Estado:
// Cerrado
// =====================================

router.patch(

    '/:id/cerrar',

    auth,

    controller.close

);




module.exports = router;