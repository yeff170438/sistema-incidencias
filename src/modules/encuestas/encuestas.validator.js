const { body, param } = require('express-validator');


// =====================================
// CREAR ENCUESTA
// =====================================

const validateCreateSurvey = [

    param('id_ticket')
        .isInt({ min: 1 })
        .withMessage(
            'El ID del ticket debe ser un número entero válido'
        )

];


// =====================================
// OBTENER ENCUESTA POR ID
// =====================================

const validateSurveyId = [

    param('id_encuesta')
        .isInt({ min: 1 })
        .withMessage(
            'El ID de la encuesta debe ser un número entero válido'
        )

];


// =====================================
// RESPONDER ENCUESTA
// =====================================

const validateAnswerSurvey = [

    body('id_encuesta')
        .isInt({ min: 1 })
        .withMessage(
            'El ID de la encuesta debe ser un número entero válido'
        ),


    body('id_ciudadano')
        .isInt({ min: 1 })
        .withMessage(
            'El ID del ciudadano debe ser un número entero válido'
        ),


    body('respuestas')
        .isArray({ min: 1 })
        .withMessage(
            'Debe proporcionar al menos una respuesta'
        ),


    body('respuestas.*.id_pregunta')
        .isInt({ min: 1 })
        .withMessage(
            'El ID de la pregunta debe ser un número entero válido'
        ),


    body('respuestas.*.respuesta_valor')
        .optional({ nullable: true })
        .isInt({ min: 1, max: 5 })
        .withMessage(
            'La calificación debe estar entre 1 y 5'
        ),


    body('respuestas.*.respuesta_texto')
        .optional({ nullable: true })
        .isString()
        .withMessage(
            'La respuesta de texto debe ser una cadena de texto'
        )

];


// =====================================
// LISTAR ENCUESTAS DEL CIUDADANO
// =====================================

const validateCitizenId = [

    param('id_ciudadano')
        .isInt({ min: 1 })
        .withMessage(
            'El ID del ciudadano debe ser un número entero válido'
        )

];


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    validateCreateSurvey,

    validateSurveyId,

    validateAnswerSurvey,

    validateCitizenId

};