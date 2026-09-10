const express =
    require('express');

const router =
    express.Router();


const controller =
    require('./archivos.controller');


const validator =
    require('./archivos.validator');


const upload =
    require('./middleware/upload.middleware');


const authMiddleware =
    require('../auth/middleware/auth.middleware');


// =====================================
// SUBIR EVIDENCIA
// =====================================

router.post(

    '/incidencias/:id_incidencia/evidencia',

    authMiddleware,

    upload.single('archivo'),

    validator.validateUploadIncidentEvidence,

    controller.uploadIncidentEvidence

);


// =====================================
// LISTAR EVIDENCIAS
// =====================================

router.get(

    '/incidencias/:id_incidencia/evidencia',

    authMiddleware,

    validator.validateIncidentId,

    controller.findByIncident

);


// =====================================
// BUSCAR ARCHIVO
// =====================================

router.get(

    '/:id_archivo',

    authMiddleware,

    validator.validateFileId,

    controller.findById

);


// =====================================
// ELIMINAR EVIDENCIA
// =====================================

router.delete(

    '/incidencias/:id_incidencia/evidencia/:id_archivo',

    authMiddleware,

    validator.validateIncidentId,

    validator.validateFileId,

    controller.deleteIncidentEvidence

);


// =====================================
// EXPORTAR
// =====================================

module.exports = router;