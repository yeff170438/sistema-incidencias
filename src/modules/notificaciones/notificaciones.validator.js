
const {
    param,
    body,
    validationResult
} = require('express-validator');



// =====================================
// PROCESAR ERRORES
// =====================================

const handleValidationErrors = (
    req,
    res,
    next
) => {

    const errors =
        validationResult(req);


    if (!errors.isEmpty()) {

        return res.status(400).json({

            mensaje:
                'Error de validación',

            errores:
                errors.array()

        });

    }


    next();

};



// =====================================
// ID NOTIFICACIÓN
// =====================================

const validateNotificationId = [

    param('id_notificacion')

        .isInt({ min: 1 })

        .withMessage(
            'El ID de la notificación debe ser un entero positivo'
        ),

    handleValidationErrors

];



// =====================================
// ID CIUDADANO
// =====================================

const validateCitizenId = [

    param('id_ciudadano')

        .isInt({ min: 1 })

        .withMessage(
            'El ID del ciudadano debe ser un entero positivo'
        ),

    handleValidationErrors

];



// =====================================
// ID INCIDENCIA
// =====================================

const validateIncidentId = [

    param('id_incidencia')

        .isInt({ min: 1 })

        .withMessage(
            'El ID de la incidencia debe ser un entero positivo'
        ),

    handleValidationErrors

];



// =====================================
// ID TICKET
// =====================================

const validateTicketId = [

    param('id_ticket')

        .isInt({ min: 1 })

        .withMessage(
            'El ID del ticket debe ser un entero positivo'
        ),

    handleValidationErrors

];



// =====================================
// CREAR NOTIFICACIÓN
// =====================================

// =====================================
// CREAR NOTIFICACIÓN
// =====================================

const validateCreate = [

    body('id_ciudadano')

        .isInt({ min: 1 })

        .withMessage(
            'El ID del ciudadano es obligatorio'
        ),


    body('mensaje')

        .trim()

        .notEmpty()

        .withMessage(
            'El mensaje es obligatorio'
        )

        .isLength({ max: 1000 })

        .withMessage(
            'El mensaje no puede superar los 1000 caracteres'
        ),


    body('tipo')

        .optional()

        .isString()

        .withMessage(
            'El tipo de notificación debe ser texto'
        )

        .isIn([
            'Sistema',
            'Correo'
        ])

        .withMessage(
            'El tipo de notificación debe ser Sistema o Correo'
        ),


    body('id_ticket')

        .optional({ nullable: true })

        .isInt({ min: 1 })

        .withMessage(
            'El ID del ticket debe ser válido'
        ),


    body('id_incidencia')

        .optional({ nullable: true })

        .isInt({ min: 1 })

        .withMessage(
            'El ID de la incidencia debe ser válido'
        ),


    handleValidationErrors

];



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    validateNotificationId,

    validateCitizenId,

    validateIncidentId,

    validateTicketId,

    validateCreate

};

