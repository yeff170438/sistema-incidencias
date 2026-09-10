const express = require('express');

const router = express.Router();


const controller = require('./usuarios.controller');

const auth = require('../auth/middleware/auth.middleware');

const authorizePermission = require('../auth/middleware/permissions.middleware');

const validator = require('./usuarios.validator');



// =====================================
// Crear usuario
// =====================================

router.post(
    '/',
    auth,
    authorizePermission('usuarios.crear'),
    validator.validateCreate,
    controller.create
);



// =====================================
// Listar usuarios
// =====================================

router.get(
    '/',
    auth,
    authorizePermission('usuarios.listar'),
    controller.findAll
);



// =====================================
// Obtener usuario por ID
// =====================================

router.get(
    '/:id',
    auth,
    authorizePermission('usuarios.ver'),
    controller.findById
);



// =====================================
// Actualizar usuario
// =====================================

router.put(
    '/:id',
    auth,
    authorizePermission('usuarios.editar'),
    validator.validateUpdate,
    controller.update
);



// =====================================
// Cambiar contraseña
// =====================================

router.patch(
    '/:id/password',
    auth,
    authorizePermission('usuarios.editar'),
    controller.changePassword
);



// =====================================
// Cambiar estado
// =====================================

router.patch(
    '/:id/status',
    auth,
    authorizePermission('usuarios.cambiar_estado'),
    controller.changeStatus
);



// =====================================
// Eliminar usuario lógico
// =====================================

router.delete(
    '/:id',
    auth,
    authorizePermission('usuarios.eliminar'),
    controller.remove
);



module.exports = router;