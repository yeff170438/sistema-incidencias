const {
    body,
    param
} = require('express-validator');



// =====================================
// Iniciar atención
// =====================================

const startAttention = [

    body('id_asignacion')

        .notEmpty()

        .withMessage(
            'La asignación es obligatoria'
        )

        .isInt()

        .withMessage(
            'El id_asignacion debe ser numérico'
        ),


    body('descripcion_atencion')

        .notEmpty()

        .withMessage(
            'La descripción de atención es obligatoria'
        )

        .isLength({

            min: 10

        })

        .withMessage(
            'La descripción debe tener mínimo 10 caracteres'
        )

];



// =====================================
// Actualizar avance
// =====================================

const updateProgress = [

    param('id_atencion')

        .isInt()

        .withMessage(
            'El id_atencion debe ser numérico'
        ),


    body('descripcion_atencion')

        .notEmpty()

        .withMessage(
            'La descripción del avance es obligatoria'
        )

        .isLength({

            min: 10

        })

        .withMessage(
            'La descripción debe tener mínimo 10 caracteres'
        ),


    body('resultado')

        .optional()

        .isString()

        .withMessage(
            'El resultado debe ser texto'
        ),


    body('conclusion')

        .optional()

        .isString()

        .withMessage(
            'La conclusión debe ser texto'
        )

];



// =====================================
// Finalizar atención
// =====================================

const finishAttention = [

    param('id_atencion')

        .isInt()

        .withMessage(
            'El id_atencion debe ser numérico'
        ),


    body('resultado')

        .notEmpty()

        .withMessage(
            'El resultado es obligatorio'
        )

        .isString()

        .withMessage(
            'El resultado debe ser texto'
        ),


    body('conclusion')

        .notEmpty()

        .withMessage(
            'La conclusión es obligatoria'
        )

        .isString()

        .withMessage(
            'La conclusión debe ser texto'
        )

];



// =====================================
// Derivar atención
// =====================================

const deriveAttention = [

    param('id_atencion')

        .isInt()

        .withMessage(
            'El id_atencion debe ser numérico'
        ),


    body('id_oficina_destino')

        .notEmpty()

        .withMessage(
            'La oficina destino es obligatoria'
        )

        .isInt()

        .withMessage(
            'El id_oficina_destino debe ser numérico'
        ),


    body('id_motivo')

        .notEmpty()

        .withMessage(
            'El motivo de derivación es obligatorio'
        )

        .isInt()

        .withMessage(
            'El id_motivo debe ser numérico'
        ),


    body('comentario')

        .notEmpty()

        .withMessage(
            'El comentario de derivación es obligatorio'
        )

        .isLength({

            min: 10

        })

        .withMessage(
            'El comentario debe tener mínimo 10 caracteres'
        )

];



// =====================================
// Finalizar atención por derivación
// =====================================

const finishAttentionByDerivation = [

    param('id_atencion')

        .isInt()

        .withMessage(
            'El id_atencion debe ser numérico'
        ),


    body('resultado')

        .optional()

        .isString()

        .withMessage(
            'El resultado debe ser texto'
        ),


    body('conclusion')

        .optional()

        .isString()

        .withMessage(
            'La conclusión debe ser texto'
        )

];



// =====================================
// Buscar atención
// =====================================

const findById = [

    param('id_atencion')

        .isInt()

        .withMessage(
            'El id_atencion debe ser numérico'
        )

];



// =====================================
// Historial ticket
// =====================================

const findByTicket = [

    param('id_ticket')

        .isInt()

        .withMessage(
            'El id_ticket debe ser numérico'
        )

];



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    startAttention,

    updateProgress,

    finishAttention,

    findById,

    findByTicket,

    deriveAttention,

    finishAttentionByDerivation

};