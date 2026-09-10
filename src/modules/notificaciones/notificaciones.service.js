const repository =
    require('./notificaciones.repository');



// =====================================
// TIPOS DE NOTIFICACIÓN
// =====================================

const TIPOS = {

    SISTEMA: 'Sistema',

    CORREO: 'Correo'

};



// =====================================
// OBTENER ID DEL TIPO
// =====================================

// =====================================
// OBTENER ID DEL TIPO
// =====================================

const getTypeId = async (
    nombre
) => {

    const tipo =
        await repository.findTypeByName(
            nombre
        );


    if (!tipo) {

        throw new Error(
            `No existe el tipo de notificación: ${nombre}`
        );

    }


    return tipo.id_tipo_notificacion;

};




// =====================================
// CREAR NOTIFICACIÓN
// =====================================

const createNotification = async (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la notificación son obligatorios'
        );

    }


    const {

        id_ticket,

        id_incidencia,

        id_usuario = null,

        id_ciudadano = null,

        mensaje,

        tipo = TIPOS.SISTEMA

    } = data;


    // =====================================
    // VALIDAR DESTINATARIO
    // =====================================

    if (
        !id_usuario &&
        !id_ciudadano
    ) {

        throw new Error(
            'La notificación debe tener un usuario o ciudadano destinatario'
        );

    }


    // =====================================
    // EVITAR DOS DESTINATARIOS
    // =====================================

    if (
        id_usuario &&
        id_ciudadano
    ) {

        throw new Error(
            'La notificación no puede tener simultáneamente un usuario y un ciudadano destinatario'
        );

    }


    // =====================================
    // VALIDAR ID USUARIO
    // =====================================

    if (
        id_usuario !== null
    ) {

        if (
            !Number.isInteger(
                Number(id_usuario)
            ) ||
            Number(id_usuario) <= 0
        ) {

            throw new Error(
                'El id_usuario debe ser un entero positivo'
            );

        }

    }


    // =====================================
    // VALIDAR ID CIUDADANO
    // =====================================

    if (
        id_ciudadano !== null
    ) {

        if (
            !Number.isInteger(
                Number(id_ciudadano)
            ) ||
            Number(id_ciudadano) <= 0
        ) {

            throw new Error(
                'El id_ciudadano debe ser un entero positivo'
            );

        }

    }


    // =====================================
    // VALIDAR REFERENCIA
    // =====================================

    if (
        !id_ticket &&
        !id_incidencia
    ) {

        throw new Error(
            'La notificación debe estar relacionada con una incidencia o ticket'
        );

    }


    // =====================================
    // VALIDAR MENSAJE
    // =====================================

    if (
        !mensaje ||
        typeof mensaje !== 'string' ||
        !mensaje.trim()
    ) {

        throw new Error(
            'El mensaje de la notificación es obligatorio'
        );

    }


    if (
        mensaje.trim().length > 5000
    ) {

        throw new Error(
            'El mensaje no puede superar los 5000 caracteres'
        );

    }


    // =====================================
    // VALIDAR TIPO
    // =====================================

    const tiposPermitidos = [

        TIPOS.SISTEMA,

        TIPOS.CORREO

    ];


    if (
        !tiposPermitidos.includes(
            tipo
        )
    ) {

        throw new Error(
            'El tipo de notificación no es válido'
        );

    }


    // =====================================
    // VALIDAR USUARIO EXISTENTE
    // =====================================

    if (
        id_usuario
    ) {

        const usuario =
            await repository.findUserById(
                id_usuario
            );


        if (!usuario) {

            throw new Error(
                'El usuario destinatario no existe'
            );

        }

    }


    // =====================================
    // VALIDAR CIUDADANO EXISTENTE
    // =====================================

    if (
        id_ciudadano
    ) {

        const ciudadano =
            await repository.findCitizenById(
                id_ciudadano
            );


        if (!ciudadano) {

            throw new Error(
                'El ciudadano destinatario no existe'
            );

        }

    }


    // =====================================
    // VALIDAR TICKET
    // =====================================

    if (id_ticket) {

        const ticket =
            await repository.findTicketById(
                id_ticket
            );


        if (!ticket) {

            throw new Error(
                'El ticket asociado no existe'
            );

        }

    }


    // =====================================
    // VALIDAR INCIDENCIA
    // =====================================

    if (id_incidencia) {

        const incidencia =
            await repository.findIncidentById(
                id_incidencia
            );


        if (!incidencia) {

            throw new Error(
                'La incidencia asociada no existe'
            );

        }

    }


    // =====================================
    // OBTENER TIPO
    // =====================================

    const id_tipo_notificacion =
        await getTypeId(
            tipo
        );


    // =====================================
    // CREAR NOTIFICACIÓN
    // =====================================

    const notification =
        await repository.create({

            id_ticket:
                id_ticket || null,

            id_incidencia:
                id_incidencia || null,

            id_usuario:
                id_usuario || null,

            id_ciudadano:
                id_ciudadano || null,

            id_tipo_notificacion,

            mensaje:
                mensaje.trim()

        });


    return notification;

};




// =====================================
// INCIDENCIA REGISTRADA
// =====================================

const notifyIncidentRegistered = async (
    data
) => {

    return await createNotification({

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            'Su incidencia fue registrada correctamente y se encuentra pendiente de validación.'

    });

};



// =====================================
// INCIDENCIA VALIDADA
// =====================================

const notifyIncidentValidated = async (
    data
) => {

    return await createNotification({

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        id_ticket:
            data.id_ticket,

        mensaje:
            'Su incidencia fue validada correctamente y se ha generado un ticket para su atención.'

    });

};



// =====================================
// INCIDENCIA OBSERVADA
// =====================================

const notifyIncidentObserved = async (
    data
) => {

    return await createNotification({

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            data.mensaje ||

            'Su incidencia fue observada. Revise las observaciones y realice las correcciones solicitadas.'

    });

};



// =====================================
// INCIDENCIA RECHAZADA
// =====================================

const notifyIncidentRejected = async (
    data
) => {

    return await createNotification({

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            data.mensaje ||

            'Su incidencia fue rechazada.'

    });

};



// =====================================
// TICKET CREADO
// =====================================

const notifyTicketCreated = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            `Se generó el ticket ${
                data.codigo_ticket ||
                data.id_ticket
            } para el seguimiento de su incidencia.`

    });

};



// =====================================
// TICKET ASIGNADO
// =====================================

const notifyTicketAssigned = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            data.mensaje ||

            'Su ticket fue asignado a la oficina responsable para su atención.'

    });

};



// =====================================
// TICKET DERIVADO
// =====================================

const notifyTicketDerived = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            data.mensaje ||

            'Su ticket fue derivado a otra oficina para continuar con su atención.'

    });

};



// =====================================
// ATENCIÓN INICIADA
// =====================================

const notifyAttentionStarted = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            'La atención de su ticket ha sido iniciada.'

    });

};



// =====================================
// ATENCIÓN FINALIZADA
// =====================================

const notifyAttentionFinished = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            'La atención de su ticket ha finalizado.'

    });

};



// =====================================
// TICKET RESUELTO
// =====================================

const notifyTicketResolved = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            'Su ticket fue resuelto. Puede revisar el resultado de la atención.'

    });

};



// =====================================
// TICKET CERRADO
// =====================================

const notifyTicketClosed = async (
    data
) => {

    return await createNotification({

        id_ticket:
            data.id_ticket,

        id_incidencia:
            data.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            'Su ticket fue cerrado. Gracias por utilizar el sistema de atención de incidencias.'

    });

};



// =====================================
// BUSCAR POR ID
// =====================================

const findById = async (
    id_notificacion
) => {

    const id =
        Number(id_notificacion);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID de notificación debe ser un entero positivo'
        );

    }


    const notification =
        await repository.findById(
            id
        );


    if (!notification) {

        throw new Error(
            'Notificación no encontrada'
        );

    }


    return notification;

};



// =====================================
// LISTAR POR CIUDADANO
// =====================================

const findByCitizen = async (
    id_ciudadano
) => {

    const id =
        Number(id_ciudadano);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID del ciudadano debe ser un entero positivo'
        );

    }


    return await repository.findByCitizen(
        id
    );

};



// =====================================
// LISTAR NO LEÍDAS
// =====================================

const findUnreadByCitizen = async (
    id_ciudadano
) => {

    const id =
        Number(id_ciudadano);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID del ciudadano debe ser un entero positivo'
        );

    }


    return await repository.findUnreadByCitizen(
        id
    );

};



// =====================================
// CONTAR NO LEÍDAS
// =====================================

const countUnreadByCitizen = async (
    id_ciudadano
) => {

    const id =
        Number(id_ciudadano);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID del ciudadano debe ser un entero positivo'
        );

    }


    return await repository.countUnreadByCitizen(
        id
    );

};



// =====================================
// NOTIFICACIONES DE INCIDENCIA
// =====================================

const findByIncident = async (
    id_incidencia
) => {

    const id =
        Number(id_incidencia);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID de la incidencia debe ser un entero positivo'
        );

    }


    return await repository.findByIncident(
        id
    );

};



// =====================================
// NOTIFICACIONES DE TICKET
// =====================================

const findByTicket = async (
    id_ticket
) => {

    const id =
        Number(id_ticket);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID del ticket debe ser un entero positivo'
        );

    }


    return await repository.findByTicket(
        id
    );

};



// =====================================
// MARCAR COMO LEÍDA
// =====================================

const markAsRead = async (
    id_notificacion
) => {

    const id =
        Number(id_notificacion);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID de notificación debe ser un entero positivo'
        );

    }


    const notification =
        await repository.findById(
            id
        );


    if (!notification) {

        throw new Error(
            'Notificación no encontrada'
        );

    }


    if (notification.leido) {

        return notification;

    }


    return await repository.markAsRead(
        id
    );

};



// =====================================
// MARCAR TODAS COMO LEÍDAS
// =====================================

const markAllAsReadByCitizen = async (
    id_ciudadano
) => {

    const id =
        Number(id_ciudadano);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID del ciudadano debe ser un entero positivo'
        );

    }


    return await repository
        .markAllAsReadByCitizen(
            id
        );

};


// =====================================
// BUSCAR RESPONSABLES DE UNA OFICINA
// =====================================

const findResponsibleUsersByOffice = async (
    id_oficina
) => {

    if (!id_oficina) {

        throw new Error(
            'La oficina es obligatoria'
        );

    }

    return await repository.findResponsibleUsersByOffice(
        id_oficina
    );

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createNotification,

    notifyIncidentRegistered,

    notifyIncidentValidated,

    notifyIncidentObserved,

    notifyIncidentRejected,

    notifyTicketCreated,

    notifyTicketAssigned,

    notifyTicketDerived,

    notifyAttentionStarted,

    notifyAttentionFinished,

    notifyTicketResolved,

    notifyTicketClosed,

    findById,

    findByCitizen,

    findUnreadByCitizen,

    countUnreadByCitizen,

    findByIncident,

    findByTicket,

    markAsRead,

    markAllAsReadByCitizen,

    findResponsibleUsersByOffice

};