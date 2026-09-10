const service =
    require('./archivos.service');


// =====================================
// SUBIR EVIDENCIA
// =====================================

const uploadIncidentEvidence = async (
    req,
    res
) => {

    try {

        // =====================================
        // Obtener ciudadano autenticado
        // =====================================

        const id_ciudadano =
            req.user.id_ciudadano;


        // =====================================
        // Datos
        // =====================================

        const {

            id_incidencia,

            id_tipo_archivo

        } = req.body;


        // =====================================
        // Ejecutar service
        // =====================================

        const resultado =
            await service.uploadIncidentEvidence({

                id_incidencia,

                id_ciudadano,

                id_tipo_archivo,

                file:
                    req.file

            });


        // =====================================
        // Respuesta
        // =====================================

        return res.status(201).json({

            success: true,

            message:
                'Evidencia registrada correctamente',

            data:
                resultado

        });

    } catch (error) {

        console.error(
            'Error al subir evidencia:',
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================
// LISTAR EVIDENCIAS
// =====================================

const findByIncident = async (
    req,
    res
) => {

    try {

        const id_ciudadano =
            req.user.id_ciudadano;


        const {
            id_incidencia
        } = req.params;


        const archivos =
            await service.findByIncident(

                id_incidencia,

                id_ciudadano

            );


        return res.status(200).json({

            success: true,

            data:
                archivos

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================
// BUSCAR ARCHIVO
// =====================================

const findById = async (
    req,
    res
) => {

    try {

        const archivo =
            await service.findById(

                req.params.id_archivo

            );


        return res.status(200).json({

            success: true,

            data:
                archivo

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================
// ELIMINAR EVIDENCIA
// =====================================

const deleteIncidentEvidence = async (
    req,
    res
) => {

    try {

        const id_ciudadano =
            req.user.id_ciudadano;


        const resultado =
            await service.deleteIncidentEvidence(

                req.params.id_incidencia,

                req.params.id_archivo,

                id_ciudadano

            );


        return res.status(200).json({

            success: true,

            message:
                resultado.message

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    uploadIncidentEvidence,

    findByIncident,

    findById,

    deleteIncidentEvidence

};  