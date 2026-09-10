
const express =
    require('express');

const router =
    express.Router();


const controller =
    require('./notificaciones.controller');


const validator =
    require('./notificaciones.validator');


const ciudadanoAuth =
    require('../ciudadanos/middleware/ciudadano.auth.middleware');



// =====================================
// BUSCAR NOTIFICACIÓN
// =====================================

router.get(

    '/:id_notificacion',

    ciudadanoAuth,

    validator.validateNotificationId,

    controller.findById

);



// =====================================
// NOTIFICACIONES DEL CIUDADANO
// =====================================

router.get(

    '/ciudadano/:id_ciudadano',

    ciudadanoAuth,

    validator.validateCitizenId,

    controller.findByCitizen

);



// =====================================
// NOTIFICACIONES NO LEÍDAS
// =====================================

router.get(

    '/ciudadano/:id_ciudadano/no-leidas',

    ciudadanoAuth,

    validator.validateCitizenId,

    controller.findUnreadByCitizen

);



// =====================================
// CONTAR NO LEÍDAS
// =====================================

router.get(

    '/ciudadano/:id_ciudadano/no-leidas/count',

    ciudadanoAuth,

    validator.validateCitizenId,

    controller.countUnreadByCitizen

);



// =====================================
// NOTIFICACIONES DE INCIDENCIA
// =====================================

router.get(

    '/incidencia/:id_incidencia',

    ciudadanoAuth,

    validator.validateIncidentId,

    controller.findByIncident

);



// =====================================
// NOTIFICACIONES DE TICKET
// =====================================

router.get(

    '/ticket/:id_ticket',

    ciudadanoAuth,

    validator.validateTicketId,

    controller.findByTicket

);



// =====================================
// MARCAR COMO LEÍDA
// =====================================

router.patch(

    '/:id_notificacion/leer',

    ciudadanoAuth,

    validator.validateNotificationId,

    controller.markAsRead

);



// =====================================
// MARCAR TODAS COMO LEÍDAS
// =====================================

router.patch(

    '/ciudadano/:id_ciudadano/leer-todas',

    ciudadanoAuth,

    validator.validateCitizenId,

    controller.markAllAsReadByCitizen

);



module.exports = router;
