const repository =
    require('./seguimiento.repository');



// =====================================
// Registrar seguimiento
// =====================================

const createTracking = async (data) => {




    // =====================================
    // Validar datos
    // =====================================

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos del seguimiento son obligatorios'
        );

    }


    // =====================================
    // Validar ticket
    // =====================================

    if (!data.id_ticket) {

        throw new Error(
            'El ticket es obligatorio'
        );

    }


    // =====================================
    // Validar usuario
    // Solo obligatorio para acciones de USUARIO
    // =====================================

    if (
        data.origen === 'USUARIO' &&
        !data.id_usuario
    ) {

        throw new Error(
            'El usuario es obligatorio'
        );

    }


    // =====================================
    // Validar acción
    // =====================================

    if (!data.accion) {

        throw new Error(
            'La acción del seguimiento es obligatoria'
        );

    }


    // =====================================
    // Validar origen
    // =====================================

    if (!data.origen) {

        throw new Error(
            'El origen del seguimiento es obligatorio'
        );

    }


    // =====================================
    // Registrar
    // =====================================

    const seguimiento =
        await repository.createTracking(
            data
        );


    if (!seguimiento) {

        throw new Error(
            'No se pudo registrar el seguimiento'
        );

    }


    return seguimiento;

};



// =====================================
// Historial del ticket
// =====================================

const findByTicket = async (
    id_ticket
) => {

    if (!id_ticket) {

        throw new Error(
            'El ID del ticket es obligatorio'
        );

    }


    const historial =
        await repository.findByTicket(
            id_ticket
        );


    return historial;

};



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createTracking,

    findByTicket

};