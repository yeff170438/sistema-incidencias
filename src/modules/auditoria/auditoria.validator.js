
// =====================================
// VALIDACIONES DEL MÓDULO DE AUDITORÍA
// =====================================


// =====================================
// Validar parámetros para listar auditoría
// =====================================

const validateList = (req, res, next) => {

    const {
        pagina,
        limite,
        accion,
        tabla_afectada,
        id_usuario,
        id_ciudadano
    } = req.query;


    // =====================================
    // Validar página
    // =====================================

    if (pagina !== undefined) {

        const numeroPagina =
            Number(pagina);

        if (
            !Number.isInteger(numeroPagina) ||
            numeroPagina < 1
        ) {

            return res.status(400).json({

                message:
                    'El parámetro pagina debe ser un entero mayor o igual a 1'

            });

        }

    }


    // =====================================
    // Validar límite
    // =====================================

    if (limite !== undefined) {

        const numeroLimite =
            Number(limite);

        if (
            !Number.isInteger(numeroLimite) ||
            numeroLimite < 1 ||
            numeroLimite > 100
        ) {

            return res.status(400).json({

                message:
                    'El parámetro limite debe ser un entero entre 1 y 100'

            });

        }

    }


    // =====================================
    // Validar acción
    // =====================================

    if (
        accion !== undefined &&
        (
            typeof accion !== 'string' ||
            accion.trim() === ''
        )
    ) {

        return res.status(400).json({

            message:
                'El parámetro accion no es válido'

        });

    }


    // =====================================
    // Validar tabla afectada
    // =====================================

    if (
        tabla_afectada !== undefined &&
        (
            typeof tabla_afectada !== 'string' ||
            tabla_afectada.trim() === ''
        )
    ) {

        return res.status(400).json({

            message:
                'El parámetro tabla_afectada no es válido'

        });

    }


    // =====================================
    // Validar usuario
    // =====================================

    if (id_usuario !== undefined) {

        const numeroUsuario =
            Number(id_usuario);

        if (
            !Number.isInteger(numeroUsuario) ||
            numeroUsuario <= 0
        ) {

            return res.status(400).json({

                message:
                    'El parámetro id_usuario no es válido'

            });

        }

    }


    // =====================================
    // Validar ciudadano
    // =====================================

    if (id_ciudadano !== undefined) {

        const numeroCiudadano =
            Number(id_ciudadano);

        if (
            !Number.isInteger(numeroCiudadano) ||
            numeroCiudadano <= 0
        ) {

            return res.status(400).json({

                message:
                    'El parámetro id_ciudadano no es válido'

            });

        }

    }


    next();

};



// =====================================
// Validar ID de auditoría
// =====================================

const validateId = (req, res, next) => {

    const id =
        Number(req.params.id);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return res.status(400).json({

            message:
                'El ID de auditoría no es válido'

        });

    }


    next();

};



// =====================================
// Exportar
// =====================================

module.exports = {

    validateList,

    validateId

};

