const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');


// =====================================
// CONFIGURACIÓN
// =====================================

const ROOT_UPLOADS =
    path.resolve(
        process.cwd(),
        'uploads'
    );


// =====================================
// TIPOS DE ALMACENAMIENTO PERMITIDOS
// =====================================

const STORAGE_TYPES = {

    incidencias:
        'incidencias',

    atenciones:
        'atenciones',

    documentos:
        'documentos'

};


// =====================================
// EXTENSIONES PERMITIDAS
// =====================================

const ALLOWED_EXTENSIONS = [

    'jpg',

    'jpeg',

    'png',

    'webp'

];


// =====================================
// GENERAR HASH SHA-256
// =====================================

const calculateHash = async (
    filePath
) => {

    const buffer =
        await fs.readFile(
            filePath
        );


    return crypto
        .createHash('sha256')
        .update(buffer)
        .digest('hex');

};


// =====================================
// GENERAR NOMBRE SEGURO
// =====================================

const generateSafeFilename = (
    extension
) => {

    const normalizedExtension =
        String(
            extension
        )
        .toLowerCase()
        .replace(
            /^\./,
            ''
        );


    if (
        !ALLOWED_EXTENSIONS.includes(
            normalizedExtension
        )
    ) {

        throw new Error(
            'Extensión de archivo no permitida'
        );

    }


    const randomName =
        crypto
            .randomBytes(32)
            .toString('hex');


    return `${randomName}.${normalizedExtension}`;

};


// =====================================
// OBTENER RUTA DE ALMACENAMIENTO
// =====================================

const getStorageDirectory = (
    tipo,
    fecha = new Date()
) => {

    const storageType =
        STORAGE_TYPES[tipo];


    if (!storageType) {

        throw new Error(
            'Tipo de almacenamiento no permitido'
        );

    }


    const year =
        fecha.getFullYear();


    const month =
        String(
            fecha.getMonth() + 1
        )
        .padStart(
            2,
            '0'
        );


    return path.join(

        ROOT_UPLOADS,

        storageType,

        String(year),

        month

    );

};


// =====================================
// GUARDAR ARCHIVO
// =====================================

const storeFile = async ({
    temporaryPath,
    extension,
    tipo = 'incidencias'
}) => {

    if (!temporaryPath) {

        throw new Error(
            'No se proporcionó el archivo temporal'
        );

    }


    // =====================================
    // Verificar archivo temporal
    // =====================================

    try {

        await fs.access(
            temporaryPath
        );

    } catch {

        throw new Error(
            'El archivo temporal no existe'
        );

    }


    // =====================================
    // Generar directorio
    // =====================================

    const directory =
        getStorageDirectory(
            tipo
        );


    await fs.mkdir(

        directory,

        {
            recursive: true
        }

    );


    // =====================================
    // Generar nombre interno
    // =====================================

    const filename =
        generateSafeFilename(
            extension
        );


    const destination =
        path.join(
            directory,
            filename
        );


    try {

        // =====================================
        // Mover archivo
        // =====================================

        await fs.rename(

            temporaryPath,

            destination

        );


        // =====================================
        // Calcular hash
        // =====================================

        const hash =
            await calculateHash(
                destination
            );


        // =====================================
        // Ruta relativa para BD
        // =====================================

        const relativePath =
            path.relative(

                process.cwd(),

                destination

            );


        return {

            nombre_servidor:
                filename,

            ruta:
                relativePath
                    .replace(
                        /\\/g,
                        '/'
                    ),

            hash

        };


    } catch (error) {

        // =====================================
        // LIMPIEZA FÍSICA
        // =====================================

        try {

            await fs.unlink(
                destination
            );

        } catch (cleanupError) {

            if (
                cleanupError.code !==
                'ENOENT'
            ) {

                console.error(
                    'Error limpiando archivo almacenado:',
                    cleanupError.message
                );

            }

        }


        throw error;

    }

};


// =====================================
// ELIMINAR ARCHIVO
// =====================================

const deleteFile = async (
    filePath
) => {

    if (!filePath) {

        return;

    }


    try {

        await fs.unlink(
            filePath
        );

    } catch (error) {

        if (
            error.code !==
            'ENOENT'
        ) {

            throw error;

        }

    }

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    calculateHash,

    generateSafeFilename,

    getStorageDirectory,

    storeFile,

    deleteFile

};