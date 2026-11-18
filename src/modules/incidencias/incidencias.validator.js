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



const validateAdminEdit = (req, res, next) => {
    const {
        id_categoria,
        id_sector,
        titulo,
        descripcion,
        direccion_texto,
        referencia,
        longitud,
        latitud
    } = req.body;

    // Categoría obligatoria
    if (
        id_categoria === undefined ||
        id_categoria === null ||
        String(id_categoria).trim() === '' ||
        !Number.isInteger(Number(id_categoria)) ||
        Number(id_categoria) <= 0
    ) {
        return res.status(400).json({
            message: 'La categoría es obligatoria y debe ser válida.'
        });
    }

    // Sector opcional
    if (
        id_sector !== undefined &&
        id_sector !== null &&
        id_sector !== '' &&
        (
            !Number.isInteger(Number(id_sector)) ||
            Number(id_sector) <= 0
        )
    ) {
        return res.status(400).json({
            message: 'El sector debe ser válido.'
        });
    }

    // Título
    if (
        typeof titulo !== 'string' ||
        titulo.trim() === '' ||
        titulo.length > 200
    ) {
        return res.status(400).json({
            message: 'El título es obligatorio y no debe superar los 200 caracteres.'
        });
    }

    // Descripción
    if (
        typeof descripcion !== 'string' ||
        descripcion.trim().length < 10
    ) {
        return res.status(400).json({
            message: 'La descripción debe tener al menos 10 caracteres.'
        });
    }

    // Dirección
    if (
        typeof direccion_texto !== 'string' ||
        direccion_texto.trim() === ''
    ) {
        return res.status(400).json({
            message: 'La dirección es obligatoria.'
        });
    }

    // Referencia opcional
    if (
        referencia !== undefined &&
        referencia !== null &&
        typeof referencia !== 'string'
    ) {
        return res.status(400).json({
            message: 'La referencia debe ser un texto válido.'
        });
    }

    // Las coordenadas deben proporcionarse juntas
    if (longitud === undefined || latitud === undefined) {
        return res.status(400).json({
            message: 'La ubicación es obligatoria.'
        });
    }

    const lng = Number(longitud);
    const lat = Number(latitud);

    if (
        longitud === null ||
        latitud === null ||
        String(longitud).trim() === '' ||
        String(latitud).trim() === '' ||
        !Number.isFinite(lng) ||
        !Number.isFinite(lat) ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
    ) {
        return res.status(400).json({
            message: 'Las coordenadas no son válidas.'
        });
    }

    next();
};

// =====================================
// Exportar
// =====================================

module.exports = {
    validateCreate,
    validateAdminEdit
};