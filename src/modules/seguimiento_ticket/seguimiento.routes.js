const express = require('express');

const router = express.Router();

const controller =
    require('./seguimiento.controller');

const validator =
    require('./seguimiento.validator');

const auth =
    require('../auth/middleware/auth.middleware');


// =====================================
// HISTORIAL DE TICKET
// =====================================

router.get(
    '/ticket/:id_ticket',
    auth,
    validator.findByTicket,
    controller.findByTicket
);


module.exports = router;