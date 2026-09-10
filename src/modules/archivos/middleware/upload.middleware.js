const multer = require('multer');
const crypto = require('crypto');


// =====================================
// ALMACENAMIENTO TEMPORAL
// =====================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            'uploads/temp'
        );

    },


    filename: (req, file, cb) => {

        const nombreTemporal =
            crypto.randomUUID();


        cb(
            null,
            nombreTemporal
        );

    }

});


// =====================================
// FILTRO BÁSICO
// =====================================

const fileFilter = (
    req,
    file,
    cb
) => {

    /*
     * Este filtro NO representa la
     * validación definitiva.
     *
     * file.mimetype puede ser manipulado
     * por el cliente.
     *
     * La validación real se realizará
     * posteriormente mediante
     * archivo_security.js y file-type.
     */

    const mimePermitidos = [

        'image/jpeg',

        'image/png',

        'image/webp'

    ];


    if (
        !mimePermitidos.includes(
            file.mimetype
        )
    ) {

        return cb(

            new Error(
                'Solo se permiten imágenes JPG, JPEG, PNG o WEBP'
            ),

            false

        );

    }


    cb(
        null,
        true
    );

};


// =====================================
// CONFIGURACIÓN MULTER
// =====================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024,

        files:
            1

    }

});


module.exports = upload;