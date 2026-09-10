const repository =
    require('./archivos.repository');


const security =
    require('./utils/archivo_security');


const storage =
    require('./utils/archivo_storage');


// =====================================
// CONFIGURACIÓN
// =====================================

// Actualmente solamente tenemos
// evidencia fotográfica.

const TIPO_ARCHIVO_IMAGEN = 1;


// =====================================
// LIMPIAR ARCHIVO FÍSICO
// =====================================

const cleanupFile = async (
    filePath
) => {

    if (!filePath) {
        return;
    }

    try {

        await storage.deleteFile(
            filePath
        );

    } catch (error) {

        console.error(
            'Error eliminando archivo físico:',
            error.message
        );

    }

};


// =====================================
// SUBIR EVIDENCIA DE INCIDENCIA
// =====================================

const uploadIncidentEvidence = async (
    data
) => {

    const {

        id_incidencia,

        id_ciudadano,

        id_tipo_archivo,

        file

    } = data;


    // =====================================
    // VALIDAR ARCHIVO
    // =====================================

    if (!file) {

        throw new Error(
            'Debe proporcionar una fotografía de evidencia'
        );

    }


    // =====================================
    // VALIDAR TIPO
    // =====================================

    if (
        Number(id_tipo_archivo) !==
        TIPO_ARCHIVO_IMAGEN
    ) {

        throw new Error(
            'El sistema solamente permite fotografías como evidencia'
        );

    }


    // =====================================
    // VALIDAR TIPO EXISTENTE
    // =====================================

    const tipoArchivo =
        await repository.findTypeById(
            id_tipo_archivo
        );


    if (!tipoArchivo) {

        throw new Error(
            'El tipo de archivo no existe'
        );

    }


    // =====================================
    // VALIDAR INCIDENCIA
    // =====================================

    const incidencia =
        await repository.findIncidentById(
            id_incidencia
        );


    if (!incidencia) {

        throw new Error(
            'La incidencia no existe'
        );

    }


    // =====================================
    // VALIDAR PROPIETARIO
    // =====================================

    if (
        Number(
            incidencia.id_ciudadano
        ) !==
        Number(
            id_ciudadano
        )
    ) {

        throw new Error(
            'No tiene permiso para adjuntar archivos a esta incidencia'
        );

    }


    // =====================================
    // VALIDAR ESTADO
    // =====================================

    if (
        incidencia.estado ===
        'Rechazada'
    ) {

        throw new Error(
            'No se puede adjuntar evidencia a una incidencia rechazada'
        );

    }


    let securityResult = null;

    let storedFile = null;

    let archivo = null;


    try {

        // =====================================
        // VALIDAR CONTENIDO REAL
        // =====================================

        securityResult =
            await security.validateImageFile(
                file.path
            );


        // =====================================
        // GUARDAR ARCHIVO
        // =====================================

        storedFile =
            await storage.storeFile({

                temporaryPath:
                    file.path,

                extension:
                    securityResult.extension,

                tipo:
                    'incidencias'

            });


        // =====================================
        // REGISTRAR ARCHIVO
        // =====================================

        archivo =
            await repository.create({

                id_tipo_archivo:
                    tipoArchivo.id_tipo_archivo,

                nombre_original:
                    file.originalname,

                nombre_servidor:
                    storedFile.nombre_servidor,

                ruta:
                    storedFile.ruta,

                extension:
                    securityResult.extension,

                mime_type:
                    securityResult.mimeType,

                tamanio:
                    securityResult.size,

                hash:
                    storedFile.hash

            });


        if (!archivo) {

            throw new Error(
                'No se pudo registrar el archivo'
            );

        }


        // =====================================
        // RELACIONAR CON INCIDENCIA
        // =====================================

        const relacion =
            await repository.createIncidentRelation(

                id_incidencia,

                archivo.id_archivo

            );


        if (!relacion) {

            throw new Error(
                'No se pudo relacionar el archivo con la incidencia'
            );

        }


        // =====================================
        // RESULTADO
        // =====================================

        return {

            archivo,

            relacion

        };


    } catch (error) {

        // =====================================
        // LIMPIAR ARCHIVO FÍSICO
        // =====================================

        if (storedFile) {

            const path =
                require('path');

            await cleanupFile(

                path.resolve(
                    process.cwd(),
                    storedFile.ruta
                )

            );

        }

        else {

            await cleanupFile(
                file.path
            );

        }


        // =====================================
        // LIMPIAR BD
        // =====================================

        if (
            archivo &&
            archivo.id_archivo
        ) {

            try {

                await repository.deleteFile(

                    archivo.id_archivo

                );

            } catch (cleanupError) {

                console.error(

                    'Error eliminando registro:',
                    cleanupError.message

                );

            }

        }


        throw error;

    }

};


// =====================================
// OBTENER EVIDENCIAS DE INCIDENCIA
// =====================================

const findByIncident = async (
    id_incidencia,
    id_ciudadano
) => {

    // =====================================
    // Buscar incidencia
    // =====================================

    const incidencia =
        await repository.findIncidentById(
            id_incidencia
        );


    if (!incidencia) {

        throw new Error(
            'La incidencia no existe'
        );

    }


    // =====================================
    // Verificar propietario
    // =====================================

    if (
        Number(
            incidencia.id_ciudadano
        ) !==
        Number(
            id_ciudadano
        )
    ) {

        throw new Error(
            'No tiene permiso para consultar estas evidencias'
        );

    }


    return await repository.findByIncident(

        id_incidencia

    );

};


// =====================================
// BUSCAR ARCHIVO POR ID
// =====================================

const findById = async (
    id_archivo
) => {

    const archivo =
        await repository.findById(
            id_archivo
        );


    if (!archivo) {

        throw new Error(
            'El archivo no existe'
        );

    }


    return archivo;

};


// =====================================
// ELIMINAR EVIDENCIA
// =====================================

const deleteIncidentEvidence = async (
    id_incidencia,
    id_archivo,
    id_ciudadano
) => {

    // =====================================
    // Buscar incidencia
    // =====================================

    const incidencia =
        await repository.findIncidentById(
            id_incidencia
        );


    if (!incidencia) {

        throw new Error(
            'La incidencia no existe'
        );

    }


    // =====================================
    // Verificar propietario
    // =====================================

    if (
        Number(
            incidencia.id_ciudadano
        ) !==
        Number(
            id_ciudadano
        )
    ) {

        throw new Error(
            'No tiene permiso para modificar esta incidencia'
        );

    }


    // =====================================
    // No permitir eliminación después
    // de validar la incidencia
    // =====================================

    if (
        incidencia.estado !==
        'Pendiente'
    ) {

        throw new Error(
            'La evidencia ya no puede eliminarse porque la incidencia dejó de estar pendiente'
        );

    }


    // =====================================
    // Buscar archivo
    // =====================================

    const archivo =
        await repository.findById(
            id_archivo
        );


    if (!archivo) {

        throw new Error(
            'El archivo no existe'
        );

    }


    // =====================================
    // Guardar ruta
    // =====================================

    const path =
        require('path');

    const physicalPath =
        path.resolve(
            process.cwd(),
            archivo.ruta
        );


    // =====================================
    // Eliminar relación
    // =====================================

    const relacion =
        await repository.deleteIncidentRelation(

            id_incidencia,

            id_archivo

        );


    if (!relacion) {

        throw new Error(
            'El archivo no pertenece a esta incidencia'
        );

    }


    // =====================================
    // Eliminar registro
    // =====================================

    const eliminado =
        await repository.deleteFile(

            id_archivo

        );


    if (!eliminado) {

        throw new Error(
            'No se pudo eliminar el registro del archivo'
        );

    }


    // =====================================
    // Eliminar archivo físico
    // =====================================

    await cleanupFile(
        physicalPath
    );


    return {

        message:
            'Evidencia eliminada correctamente'

    };

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