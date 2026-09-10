const express = require('express');

const router = express.Router();


const controller = require('./auth.controller');



// =====================================================
// LOGIN USUARIO MUNICIPAL
// =====================================================

router.post(

    '/usuario/login',

    controller.loginUsuarioController

);



// =====================================================
// LOGIN CIUDADANO
// =====================================================

router.post(

    '/ciudadano/login',

    controller.loginCiudadanoController

);



module.exports = router;