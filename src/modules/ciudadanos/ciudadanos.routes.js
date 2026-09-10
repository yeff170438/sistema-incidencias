const express = require('express');

const router = express.Router();


const controller = require('./ciudadanos.controller');

const validator = require('./ciudadanos.validator');


const ciudadanoAuth =
require('./middleware/ciudadano.auth.middleware');


router.get(
    '/perfil',
    ciudadanoAuth,
    controller.profile
);
// =====================================================
// REGISTRO DE CIUDADANO
// =====================================================

router.post(

    '/',

    validator.validateCreate,

    controller.create

);





// =====================================================
// LOGIN CIUDADANO
// =====================================================

router.post(

    '/login',

    validator.validateLogin,

    controller.login

);





// =====================================================
// LISTAR CIUDADANOS
// (Futuro: protegido con ADMIN)
// =====================================================

router.get(

    '/',

    controller.findAll

);





// =====================================================
// BUSCAR CIUDADANO POR ID
// =====================================================

router.get(

    '/:id',

    controller.findById

);





// =====================================================
// BUSCAR POR DNI
// IMPORTANTE:
// Esta ruta debe ir antes de /:id
// =====================================================

router.get(

    '/dni/:dni',

    controller.findByDni

);





// =====================================================
// ACTUALIZAR CIUDADANO
// =====================================================

router.put(

    '/:id',

    validator.validateUpdate,

    controller.update

);





// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================

router.patch(

    '/:id/password',

    validator.validatePassword,

    controller.changePassword

);





// =====================================================
// VERIFICAR CORREO
// =====================================================

router.patch(

    '/:id/verify',

    controller.verifyEmail

);





// =====================================================
// ELIMINACIÓN LÓGICA
// =====================================================

router.delete(

    '/:id',

    controller.remove

);





module.exports = router;