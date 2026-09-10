const repository =
    require('./comunicaciones.repository');



// =====================================
// CREAR COMUNICACIÓN
// =====================================

const createCommunication = async (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la comunicación son obligatorios'
        );

    }


    const {

        id_ticket,

        tipo_emisor,

        id_usuario,

        id_ciudadano,

        mensaje

    } = data;


    // =====================================
    // VALIDAR TICKET
    // =====================================

    if (!id_ticket) {

        throw new Error(
            'El ticket es obligatorio'
        );

    }


    const ticket =
        await repository.findTicketById(
            id_ticket
        );


    if (!ticket) {

        throw new Error(
            'El ticket no existe'
        );

    }


    // =====================================
    // VALIDAR TIPO DE EMISOR
    // =====================================

    const tiposPermitidos = [

        'USUARIO',

        'CIUDADANO',

        'SISTEMA'

    ];


    if (!tipo_emisor) {

        throw new Error(
            'El tipo de emisor es obligatorio'
        );

    }


    if (
        !tiposPermitidos.includes(
            tipo_emisor
        )
    ) {

        throw new Error(
            'El tipo de emisor no es válido'
        );

    }


    // =====================================
    // VALIDAR MENSAJE
    // =====================================

    if (
        typeof mensaje !== 'string' ||
        !mensaje.trim()
    ) {

        throw new Error(
            'El mensaje es obligatorio'
        );

    }


    // =====================================
    // DETERMINAR EMISOR
    // =====================================

    let usuarioEmisor = null;

    let ciudadanoEmisor = null;


    // =====================================
    // EMISOR USUARIO
    // =====================================

    if (
        tipo_emisor === 'USUARIO'
    ) {

        if (!id_usuario) {

            throw new Error(
                'Debe indicar el usuario emisor'
            );

        }


        usuarioEmisor =
            await repository.findUserById(
                id_usuario
            );


        if (!usuarioEmisor) {

            throw new Error(
                'El usuario emisor no existe'
            );

        }


        if (
            usuarioEmisor.estado !== true
        ) {

            throw new Error(
                'El usuario emisor no está activo'
            );

        }

    }


    // =====================================
    // EMISOR CIUDADANO
    // =====================================

    if (
        tipo_emisor === 'CIUDADANO'
    ) {

        if (!id_ciudadano) {

            throw new Error(
                'Debe indicar el ciudadano emisor'
            );

        }


        ciudadanoEmisor =
            await repository.findCitizenById(
                id_ciudadano
            );


        if (!ciudadanoEmisor) {

            throw new Error(
                'El ciudadano emisor no existe'
            );

        }

    }


    // =====================================
    // EMISOR SISTEMA
    // =====================================

    if (
        tipo_emisor === 'SISTEMA'
    ) {

        usuarioEmisor = null;

        ciudadanoEmisor = null;

    }


    // =====================================
    // CREAR COMUNICACIÓN
    // =====================================

    const comunicacion =
        await repository.create({

            id_ticket,

            tipo_emisor,

            id_usuario:
                usuarioEmisor
                    ? usuarioEmisor.id_usuario
                    : null,

            id_ciudadano:
                ciudadanoEmisor
                    ? ciudadanoEmisor.id_ciudadano
                    : null,

            mensaje:
                mensaje.trim()

        });


    if (!comunicacion) {

        throw new Error(
            'No se pudo crear la comunicación'
        );

    }


    return comunicacion;

};



// =====================================
// BUSCAR COMUNICACIÓN POR ID
// =====================================

const findById = async (
    id_comunicacion
) => {

    if (!id_comunicacion) {

        throw new Error(
            'El ID de la comunicación es obligatorio'
        );

    }


    const comunicacion =
        await repository.findById(
            id_comunicacion
        );


    if (!comunicacion) {

        throw new Error(
            'La comunicación no existe'
        );

    }


    return comunicacion;

};



// =====================================
// HISTORIAL DE COMUNICACIONES
// DE UN TICKET
// =====================================

const findByTicket = async (
    id_ticket
) => {

    if (!id_ticket) {

        throw new Error(
            'El ticket es obligatorio'
        );

    }


    const historial =
        await repository.findByTicket(
            id_ticket
        );


    return historial;

};



// =====================================
// LISTAR TODAS LAS COMUNICACIONES
// =====================================

const findAll = async () => {

    return await repository.findAll();

};



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createCommunication,

    findById,

    findByTicket,

    findAll

};