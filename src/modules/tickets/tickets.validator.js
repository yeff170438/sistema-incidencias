// =====================================
// TICKETS VALIDATOR
// =====================================


// =====================================
// VALIDAR ID DE TICKET
// =====================================

const validateTicketId = (
    id_ticket
) => {

    if (
        id_ticket === undefined ||
        id_ticket === null ||
        id_ticket === ''
    ) {

        throw new Error(
            'El ID del ticket es obligatorio'
        );

    }


    const id =
        Number(id_ticket);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID del ticket no es válido'
        );

    }


    return id;

};


// =====================================
// VALIDAR MODALIDAD DE ATENCIÓN
// =====================================

const validateAttentionMode = (
    modalidad_atencion
) => {

    if (
        !modalidad_atencion ||
        typeof modalidad_atencion !== 'string'
    ) {

        throw new Error(
            'La modalidad de atención es obligatoria'
        );

    }


    const modalidad =
        modalidad_atencion
            .trim()
            .toUpperCase();


    const modalidadesPermitidas = [

        'ATENCION_DIRECTA',

        'SOLICITUD_ADMINISTRATIVA'

    ];


    if (
        !modalidadesPermitidas.includes(
            modalidad
        )
    ) {

        throw new Error(
            'La modalidad de atención no es válida'
        );

    }


    return modalidad;

};


// =====================================
// VALIDAR DATOS PARA SELECCIONAR
// MODALIDAD DE ATENCIÓN
// =====================================

const validateAttentionModeData = (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la modalidad son obligatorios'
        );

    }


    const modalidad_atencion =
        validateAttentionMode(
            data.modalidad_atencion
        );


    return {

        modalidad_atencion

    };

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    validateTicketId,

    validateAttentionMode,

    validateAttentionModeData

};