const express = require('express');

const router =
    express.Router();
const authMiddleware =
    require('../auth/middleware/auth.middleware');
const controller =
    require('./solicitudes_incidencias.controller');


// =====================================
// CREAR SAIU
// =====================================

router.post(
    '/',
    controller.createSAIU
);


// =====================================
// LISTAR SAIU
// =====================================

router.get(
    '/',
    controller.findAll
);


// =====================================
// BUSCAR SAIU POR ID
// =====================================

router.get(
    '/:id_saiu',
    controller.findById
);


// =====================================
// BUSCAR SAIU POR TICKET
// =====================================

router.get(
    '/ticket/:id_ticket',
    controller.findByTicket
);


// =====================================
// BUSCAR SAIU POR CÓDIGO
// =====================================

router.get(
    '/codigo/:codigo_saiu',
    controller.findByCodigo
);


// =====================================
// REGISTRAR EXPEDIENTE
// =====================================

router.post(
    '/expediente',
    authMiddleware,
    controller.registerExpediente
);




router.get(
    '/:id_saiu/solicitud',
    authMiddleware,
    controller.getAdministrativeRequest
);

// =====================================
// CONFIRMAR RECEPCIÓN
// =====================================

router.post(
    '/recibir',
    authMiddleware,
    controller.receiveSAIU
);


// =====================================
// CORREGIR NÚMERO DE EXPEDIENTE
// =====================================

// =====================================
// CORREGIR EXPEDIENTE
// =====================================

router.patch(
    '/expediente/corregir',
    authMiddleware,
    controller.updateExpediente
);
// =====================================
// EXPORTAR
// =====================================

module.exports = router;