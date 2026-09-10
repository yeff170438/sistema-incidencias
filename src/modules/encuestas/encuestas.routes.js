const express =
    require('express');

const router =
    express.Router();


const controller =
    require('./encuestas.controller');


const {

    validateCreateSurvey,

    validateSurveyId,

    validateAnswerSurvey,

    validateCitizenId

} = require('./encuestas.validator');


const authMiddleware =
    require('../auth/middleware/auth.middleware');

const permissionMiddleware =
    require('../auth/middleware/permissions.middleware');

// =====================================================
// CIUDADANO
// =====================================================


// =====================================
// Obtener preguntas disponibles
// =====================================

router.get(

    '/preguntas',

    authMiddleware,

    controller.findQuestions

);


// =====================================
// Obtener encuestas del ciudadano
// =====================================

router.get(

    '/ciudadano/:id_ciudadano',

    authMiddleware,

    validateCitizenId,

    controller.findByCitizen

);


// =====================================
// Obtener encuestas pendientes
// =====================================

router.get(

    '/ciudadano/:id_ciudadano/pendientes',

    authMiddleware,

    validateCitizenId,

    controller.findPendingByCitizen

);


// =====================================
// Obtener encuesta completa
// =====================================

router.get(

    '/:id_encuesta/completa',

    authMiddleware,

    validateSurveyId,

    controller.findCompleteById

);


// =====================================
// Responder encuesta
// =====================================

router.post(

    '/responder',

    authMiddleware,

    validateAnswerSurvey,

    controller.answerSurvey

);


// =====================================================
// SISTEMA / PROCESO INTERNO
// =====================================================


// =====================================
// Crear encuesta para un ticket cerrado
// =====================================

router.post(

    '/ticket/:id_ticket',

    authMiddleware,

    validateCreateSurvey,

    controller.createSurvey

);


// =====================================
// Expirar encuesta
// =====================================

router.patch(

    '/:id_encuesta/expirar',

    authMiddleware,

    validateSurveyId,

    controller.expireSurvey

);


// =====================================================
// PERSONAL MUNICIPAL
// =====================================================


// =====================================
// Ver encuesta
// =====================================

router.get(

    '/:id_encuesta',

    authMiddleware,

    validateSurveyId,

    permissionMiddleware('encuestas.ver'),

    controller.findById

);


// =====================================
// Estadísticas
// =====================================

router.get(

    '/estadisticas',

    authMiddleware,

    permissionMiddleware('encuestas.estadisticas'),

    controller.getStatistics

);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;