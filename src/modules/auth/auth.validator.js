const { body } = require('express-validator');



// =====================================================
// VALIDAR LOGIN USUARIO MUNICIPAL
// =====================================================

const validateLoginUsuario = [

    body('correo')

        .notEmpty()

        .withMessage(
            'El correo es obligatorio'
        )

        .isEmail()

        .withMessage(
            'El correo no tiene formato válido'
        ),



    body('password')

        .notEmpty()

        .withMessage(
            'La contraseña es obligatoria'
        )

];





// =====================================================
// VALIDAR LOGIN CIUDADANO
// =====================================================

const validateLoginCiudadano = [

    body('correo')

        .notEmpty()

        .withMessage(
            'El correo es obligatorio'
        )

        .isEmail()

        .withMessage(
            'El correo no tiene formato válido'
        ),



    body('password')

        .notEmpty()

        .withMessage(
            'La contraseña es obligatoria'
        )

];





module.exports = {


    validateLoginUsuario,

    validateLoginCiudadano


};