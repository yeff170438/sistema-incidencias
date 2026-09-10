// =====================================
// Validar creación de incidencia
// =====================================

const validateCreate = (req, res, next) => {

    const {

        id_categoria,
        titulo,
        descripcion,
        direccion_texto,
        longitud,
        latitud

    } = req.body;



    // ===============================
    // Categoría
    // ===============================

    if (!id_categoria) {

        return res.status(400).json({

            message: "La categoría es obligatoria"

        });

    }

    if (!Number.isInteger(Number(id_categoria))) {

        return res.status(400).json({

            message: "La categoría es inválida"

        });

    }



    // ===============================
    // Título
    // ===============================

    if (!titulo || titulo.trim() === "") {

        return res.status(400).json({

            message: "El título es obligatorio"

        });

    }

    if (titulo.length > 200) {

        return res.status(400).json({

            message: "El título no puede superar los 200 caracteres"

        });

    }



    // ===============================
    // Descripción
    // ===============================

    if (!descripcion || descripcion.trim() === "") {

        return res.status(400).json({

            message: "La descripción es obligatoria"

        });

    }

    if (descripcion.length < 10) {

        return res.status(400).json({

            message: "La descripción debe tener mínimo 10 caracteres"

        });

    }



    // ===============================
    // Dirección
    // ===============================

    if (!direccion_texto || direccion_texto.trim() === "") {

        return res.status(400).json({

            message: "La dirección es obligatoria"

        });

    }



    // ===============================
    // Coordenadas
    // ===============================

    if (

        longitud === undefined ||

        latitud === undefined

    ) {

        return res.status(400).json({

            message: "La ubicación es obligatoria"

        });

    }



    const lng = Number(longitud);

    const lat = Number(latitud);



    if (

        Number.isNaN(lng) ||

        Number.isNaN(lat)

    ) {

        return res.status(400).json({

            message: "Las coordenadas deben ser numéricas"

        });

    }



    if (

        lng < -180 ||

        lng > 180

    ) {

        return res.status(400).json({

            message: "Longitud inválida"

        });

    }



    if (

        lat < -90 ||

        lat > 90

    ) {

        return res.status(400).json({

            message: "Latitud inválida"

        });

    }



    next();

};



// =====================================
// Exportar
// =====================================

module.exports = {

    validateCreate

};