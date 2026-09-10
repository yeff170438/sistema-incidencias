const express = require('express');

const router = express.Router();


const controller =
    require('./derivaciones.controller');


const validator =
    require('./derivaciones.validator');



const auth =
    require('../auth/middleware/auth.middleware');




// =====================================
// DERIVACIONES
// =====================================


// Crear derivación de ticket

router.post(

    '/',

    auth,

    validator.validateCreateDerivation,

    controller.createDerivation

);



module.exports = router;