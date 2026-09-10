// =====================================
// VALIDAR SUBIDA DE EVIDENCIA
// =====================================

const validateUploadIncidentEvidence = (
    req,
    res,
    next
) => {

    // =====================================
    // Verificar archivo
    // =====================================

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message:
                'Debe seleccionar una fotografía de evidencia'

        });

    }


    // =====================================
    // Validar incidencia
    // =====================================

    const {
        id_incidencia,
        id_tipo_archivo
    } = req.body;


    if (!id_incidencia) {

        return res.status(400).json({

            success: false,

            message:
                'Debe indicar la incidencia'

        });

    }


    if (
        !Number.isInteger(
            Number(id_incidencia)
        ) ||
        Number(id_incidencia) <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                'El ID de incidencia no es válido'

        });

    }


    // =====================================
    // Validar tipo de archivo
    // =====================================

    if (!id_tipo_archivo) {

        return res.status(400).json({

            success: false,

            message:
                'Debe indicar el tipo de archivo'

        });

    }


    if (
        Number(id_tipo_archivo) !== 1
    ) {

        return res.status(400).json({

            success: false,

            message:
                'El tipo de archivo permitido es Imagen'

        });

    }


    // =====================================
    // Continuar
    // =====================================

    next();

};


// =====================================
// VALIDAR ID DE INCIDENCIA
// =====================================

const validateIncidentId = (
    req,
    res,
    next
) => {

    const {
        id_incidencia
    } = req.params;


    if (
        !Number.isInteger(
            Number(id_incidencia)
        ) ||
        Number(id_incidencia) <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                'El ID de incidencia no es válido'

        });

    }


    next();

};


// =====================================
// VALIDAR ID DE ARCHIVO
// =====================================

const validateFileId = (
    req,
    res,
    next
) => {

    const {
        id_archivo
    } = req.params;


    if (
        !Number.isInteger(
            Number(id_archivo)
        ) ||
        Number(id_archivo) <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                'El ID de archivo no es válido'

        });

    }


    next();

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    validateUploadIncidentEvidence,

    validateIncidentId,

    validateFileId

};