const fs = require('fs/promises');


// =====================================
// CONFIGURACIÓN
// =====================================

const MAX_SIZE =
    5 * 1024 * 1024;


// =====================================
// TIPOS PERMITIDOS
// =====================================

const TIPOS_PERMITIDOS = {

    jpg: {
        mime: 'image/jpeg'
    },

    jpeg: {
        mime: 'image/jpeg'
    },

    png: {
        mime: 'image/png'
    },

    webp: {
        mime: 'image/webp'
    }

};


// =====================================
// VALIDAR ARCHIVO FÍSICO
// =====================================

const validateImageFile = async (
    filePath
) => {

    // =====================================
    // VALIDAR RUTA
    // =====================================

    if (!filePath) {

        throw new Error(
            'No se proporcionó el archivo'
        );

    }


    // =====================================
    // VERIFICAR EXISTENCIA
    // =====================================

    try {

        await fs.access(
            filePath
        );

    } catch {

        throw new Error(
            'El archivo no existe'
        );

    }


    // =====================================
    // OBTENER INFORMACIÓN FÍSICA
    // =====================================

    const stats =
        await fs.stat(
            filePath
        );


    // =====================================
    // VALIDAR ARCHIVO VACÍO
    // =====================================

    if (
        !stats.isFile()
    ) {

        throw new Error(
            'El archivo proporcionado no es un archivo válido'
        );

    }


    if (
        stats.size <= 0
    ) {

        throw new Error(
            'El archivo está vacío'
        );

    }


    // =====================================
    // VALIDAR TAMAÑO
    // =====================================

    if (
        stats.size > MAX_SIZE
    ) {

        throw new Error(
            'El archivo supera el tamaño máximo permitido de 5 MB'
        );

    }


    // =====================================
    // DETECTAR TIPO REAL
    // =====================================

    const fileType =
        await import('file-type');


    const detected =
        await fileType.fileTypeFromFile(
            filePath
        );


    // =====================================
    // TIPO NO RECONOCIDO
    // =====================================

    if (!detected) {

        throw new Error(
            'No se pudo determinar el tipo real del archivo'
        );

    }


    // =====================================
    // VALIDAR MIME REAL
    // =====================================

    const mimePermitidos =
        Object.values(
            TIPOS_PERMITIDOS
        ).map(
            tipo => tipo.mime
        );


    if (
        !mimePermitidos.includes(
            detected.mime
        )
    ) {

        throw new Error(
            'El contenido del archivo no corresponde a una imagen permitida'
        );

    }


    // =====================================
    // OBTENER EXTENSIÓN REAL
    // =====================================

    const extension =
        detected.ext.toLowerCase();


    // =====================================
    // VALIDAR EXTENSIÓN REAL
    // =====================================

    if (
        !Object.prototype.hasOwnProperty.call(
            TIPOS_PERMITIDOS,
            extension
        )
    ) {

        throw new Error(
            'La extensión real del archivo no está permitida'
        );

    }


    // =====================================
    // VALIDAR EXTENSIÓN VS MIME
    // =====================================

    const tipoPermitido =
        TIPOS_PERMITIDOS[
            extension
        ];


    if (
        tipoPermitido.mime !==
        detected.mime
    ) {

        throw new Error(
            'La extensión y el tipo real del archivo no coinciden'
        );

    }


    // =====================================
    // RESULTADO
    // =====================================

    return {

        extension,

        mimeType:
            detected.mime,

        size:
            stats.size

    };

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    validateImageFile

};