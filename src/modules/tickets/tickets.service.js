
const repository = require('./tickets.repository');

const seguimientoService =
    require('../seguimiento_ticket/seguimiento.service');

const auditoriaService =
    require('../auditoria/auditoria.service');

const comunicacionesService =
    require('../comunicaciones/comunicaciones.service');

const notificacionesService =
    require('../notificaciones/notificaciones.service');

const encuestasService =
    require('../encuestas/encuestas.service');

const solicitudesIncidenciasService =
    require('../solicitudes_incidencias/solicitudes_incidencias.service');

const asignacionesService =
    require('../asignaciones/asignaciones.service');
// =====================================
// Generar código ticket
// =====================================

const generateCode = () => {

    const fecha = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

    const numero = Math.floor(
        Math.random() * 99999
    )
        .toString()
        .padStart(5, '0');

    return `TCK-${fecha}-${numero}`;
};





// =====================================
// Validar transición de estados
// =====================================

const validateTransition = (
    estadoActual,
    estadoNuevo
) => {

    const transitions = {

        'Pendiente de asignación': [
            'Asignado'
        ],

        'Asignado': [
            'En Atención'
        ],

        'En Atención': [
            'Resuelto'
        ],

        'Resuelto': [
            'Cerrado'
        ],

        'Cerrado': []

    };

    const permitidos =
        transitions[estadoActual] || [];

    if (
        !permitidos.includes(
            estadoNuevo
        )
    ) {

        throw new Error(
            `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`
        );

    }

};


// =====================================
// Crear ticket desde incidencia validada
// =====================================

const createTicketFromIncident = async (
    id_incidencia,
    id_usuario
) => {

    const existe =
        await repository.findByIncidencia(
            id_incidencia
        );

    if (existe) {

        throw new Error(
            'La incidencia ya tiene un ticket generado'
        );

    }

    const incidencia =
        await repository.findIncidentForTicket(
            id_incidencia
        );

    if (!incidencia) {

        throw new Error(
            'La incidencia no existe'
        );

    }

    const estado =
        await repository.findStateByName(
            'TICKET',
            'Pendiente de asignación'
        );

    if (!estado) {

        throw new Error(
            'No existe el estado Pendiente de asignación'
        );

    }

    const id_prioridad = incidencia.id_prioridad_predeterminada;

    if (!id_prioridad) {
        throw new Error(
            'La categoría de la incidencia no tiene una prioridad predeterminada configurada'
        );
    }

    const ticket = {

        codigo_ticket:
            generateCode(),

        id_incidencia:
            incidencia.id_incidencia,

        id_estado:
            estado.id_estado,

        id_prioridad,

        fecha_limite: null

    };

    const ticketCreado =
        await repository.create(
            ticket
        );


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket:
            ticketCreado.id_ticket,

        id_usuario:
            id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        origen:
            'SISTEMA',

        accion:
            'CREACION_TICKET',

        id_estado_anterior:
            incidencia.id_estado,

        id_estado_nuevo:
            ticketCreado.id_estado,

        comentario:
            'Ticket generado automáticamente desde incidencia validada'

    });


    // =====================================
    // Comunicación
    // =====================================

    await comunicacionesService.createCommunication({

        id_ticket:
            ticketCreado.id_ticket,

        tipo_emisor:
            'SISTEMA',

        id_usuario:
            null,

        id_ciudadano:
            incidencia.id_ciudadano,

        mensaje:
            `Se generó automáticamente el ticket ${ticketCreado.codigo_ticket} a partir de la incidencia ${incidencia.codigo_incidencia}.`

    });


    // =====================================
    // Auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        accion:
            'CREACION_TICKET',

        tabla_afectada:
            'tickets',

        registro_afectado:
            ticketCreado.id_ticket,

        valores_modificados: {

            id_incidencia:
                incidencia.id_incidencia,

            estado_inicial:
                'Pendiente de asignación',

            codigo_ticket:
                ticketCreado.codigo_ticket,

            id_prioridad:
                ticketCreado.id_prioridad,

            fecha_limite:
                ticketCreado.fecha_limite

        }

    });


    // =====================================
    // Notificación ciudadano
    // =====================================

    await notificacionesService.createNotification({

        id_ticket:
            ticketCreado.id_ticket,

        id_incidencia:
            incidencia.id_incidencia,

        id_ciudadano:
            incidencia.id_ciudadano,

        id_tipo_notificacion:
            1,

        mensaje:
            `Se generó el ticket ${ticketCreado.codigo_ticket} para dar seguimiento a tu incidencia ${incidencia.codigo_incidencia}.`

    });


    return ticketCreado;

};


// =====================================
// Obtener ticket
// =====================================

const findById = async (
    id_ticket
) => {

    const ticket =
        await repository.findById(
            id_ticket
        );

    if (!ticket) {

        throw new Error(
            'Ticket no encontrado'
        );

    }

    return ticket;

};

// =====================================
// Buscar ticket por incidencia
// =====================================

const findByIncidencia = async (id_incidencia) => {
    return await repository.findByIncidencia(id_incidencia);
};
// =====================================
// Listar tickets
// =====================================

const findAll = async () => {

    return await repository.findAll();

};


// =====================================
// Asignar ticket
// =====================================

const assignTicket = async (
    id_ticket,
    id_usuario
) => {

    const ticket =
        await repository.findById(
            id_ticket
        );

    if (!ticket) {

        throw new Error(
            'Ticket no encontrado'
        );

    }

    const estadoNuevo =
        await repository.findStateByName(
            'TICKET',
            'Asignado'
        );

    if (!estadoNuevo) {

        throw new Error(
            'No existe el estado Asignado'
        );

    }

    validateTransition(
        ticket.estado,
        estadoNuevo.nombre
    );

    const resultado =
        await repository.assignTicket(
            id_ticket,
            estadoNuevo.id_estado
        );


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket,

        id_usuario,

        id_ciudadano:
            null,

        origen:
            'USUARIO',

        accion:
            'ASIGNACION_TICKET',

        id_estado_anterior:
            ticket.id_estado,

        id_estado_nuevo:
            estadoNuevo.id_estado,

        comentario:
            'Ticket asignado correctamente.'

    });





    return resultado;

};


// =====================================
// Iniciar atención
// =====================================

const startAttention = async (
    id_ticket,
    id_usuario
) => {

    const ticket =
        await repository.findById(
            id_ticket
        );

    if (!ticket) {

        throw new Error(
            'Ticket no encontrado'
        );

    }

    const estadoNuevo =
        await repository.findStateByName(
            'TICKET',
            'En Atención'
        );

    if (!estadoNuevo) {

        throw new Error(
            'No existe estado En Atención'
        );

    }

    validateTransition(
        ticket.estado,
        estadoNuevo.nombre
    );

    const resultado =
        await repository.startAttention(
            id_ticket,
            estadoNuevo.id_estado
        );


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket,

        id_usuario,

        id_ciudadano:
            null,

        origen:
            'USUARIO',

        accion:
            'INICIO_ATENCION',

        id_estado_anterior:
            ticket.id_estado,

        id_estado_nuevo:
            estadoNuevo.id_estado,

        comentario:
            'La atención del ticket fue iniciada.'

    });


    // =====================================
    // Comunicación
    // =====================================

    await comunicacionesService.create({

        id_ticket,

        tipo_emisor:
            'USUARIO',

        id_usuario,

        id_ciudadano:
            null,

        mensaje:
            'La atención del ticket fue iniciada.'

    });





    return resultado;

};


// =====================================
// Resolver ticket
// =====================================

const resolveTicket = async (
    id_ticket,
    id_usuario
) => {

    const ticket =
        await repository.findById(
            id_ticket
        );

    if (!ticket) {

        throw new Error(
            'Ticket no encontrado'
        );

    }

    const estadoNuevo =
        await repository.findStateByName(
            'TICKET',
            'Resuelto'
        );

    if (!estadoNuevo) {

        throw new Error(
            'No existe estado Resuelto'
        );

    }

    validateTransition(
        ticket.estado,
        estadoNuevo.nombre
    );

    const resultado =
        await repository.resolveTicket(
            id_ticket,
            estadoNuevo.id_estado
        );


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket,

        id_usuario,

        id_ciudadano:
            null,

        origen:
            'USUARIO',

        accion:
            'RESOLUCION_TICKET',

        id_estado_anterior:
            ticket.id_estado,

        id_estado_nuevo:
            estadoNuevo.id_estado,

        comentario:
            'El ticket fue marcado como resuelto.'

    });


    // =====================================
    // Comunicación
    // =====================================

    await comunicacionesService.create({

        id_ticket,

        tipo_emisor:
            'USUARIO',

        id_usuario,

        id_ciudadano:
            null,

        mensaje:
            'El ticket fue marcado como resuelto.'

    });


    // =====================================
    // Notificación ciudadano
    // =====================================

    await notificacionesService.createNotification({

        id_ticket,

        id_incidencia:
            ticket.id_incidencia,

        id_ciudadano:
            ticket.id_ciudadano,

        id_tipo_notificacion:
            1,

        mensaje:
            `Tu ticket ${ticket.codigo_ticket} fue marcado como resuelto. Puedes revisar el resultado de la atención.`

    });


    return resultado;

};


// =====================================
// Cerrar ticket
// =====================================

const closeTicket = async (
    id_ticket,
    observacion_cierre,
    id_usuario
) => {

    const ticket =
        await repository.findById(
            id_ticket
        );

    if (!ticket) {

        throw new Error(
            'Ticket no encontrado'
        );

    }


    if (
        ticket.estado !== 'Resuelto'
    ) {

        throw new Error(
            'Solo se pueden cerrar tickets resueltos'
        );

    }


    const estado =
        await repository.findStateByName(
            'TICKET',
            'Cerrado'
        );

    if (!estado) {

        throw new Error(
            'No existe estado Cerrado'
        );

    }


    // =====================================
    // Cerrar ticket
    // =====================================

    const resultado =
        await repository.closeTicket(

            id_ticket,

            estado.id_estado,

            observacion_cierre

        );


    if (!resultado) {

        throw new Error(
            'No se pudo cerrar el ticket'
        );

    }


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket,

        id_usuario,

        id_ciudadano:
            null,

        origen:
            'USUARIO',

        accion:
            'CIERRE_TICKET',

        id_estado_anterior:
            ticket.id_estado,

        id_estado_nuevo:
            estado.id_estado,

        comentario:
            observacion_cierre ||
            'Ticket cerrado correctamente.'

    });


    // =====================================
    // Auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario,

        id_ciudadano:
            ticket.id_ciudadano,

        accion:
            'CIERRE_TICKET',

        tabla_afectada:
            'tickets',

        registro_afectado:
            id_ticket,

        valores_modificados: {

            estado_anterior:
                'Resuelto',

            estado_nuevo:
                'Cerrado',

            observacion:
                observacion_cierre

        }

    });


    // =====================================
    // Crear encuesta
    // =====================================

    await encuestasService.createSurvey(
        id_ticket
    );


    // =====================================
    // Retornar resultado
    // =====================================

    return resultado;

};


// =====================================
// SELECCIONAR MODALIDAD DE ATENCIÓN
// =====================================

const selectAttentionMode = async (
    id_ticket,
    modalidad_atencion,
    id_usuario
) => {

    // =====================================
    // BUSCAR TICKET
    // =====================================

    const ticket =
        await repository.findById(
            id_ticket
        );


    if (!ticket) {

        throw new Error(
            'El ticket no existe'
        );

    }


    // =====================================
    // VALIDAR ESTADO DEL TICKET
    // =====================================

    if (
        ticket.estado !==
        'Pendiente de asignación'
    ) {

        throw new Error(
            'Solo se puede seleccionar la modalidad cuando el ticket está pendiente de asignación'
        );

    }


    // =====================================
    // VALIDAR MODALIDAD NO SELECCIONADA
    // =====================================

    if (
        ticket.modalidad_atencion
    ) {

        throw new Error(
            'La modalidad de atención ya fue seleccionada'
        );

    }


    // =====================================
    // NORMALIZAR MODALIDAD
    // =====================================

    const modalidad =
        String(
            modalidad_atencion
        )
        .trim()
        .toUpperCase();


    // =====================================
    // VALIDAR MODALIDAD
    // =====================================

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


    // =====================================
    // REGISTRAR MODALIDAD
    // =====================================

    const ticketActualizado =
        await repository.setAttentionMode(

            id_ticket,

            modalidad

        );


    if (!ticketActualizado) {

        throw new Error(
            'No se pudo registrar la modalidad de atención'
        );

    }


    // =====================================
    // ATENCIÓN DIRECTA
    // =====================================

    if (
        modalidad ===
        'ATENCION_DIRECTA'
    ) {

        // =================================
        // CREAR ASIGNACIÓN AUTOMÁTICA
        // =================================

        const asignacion =
            await asignacionesService
                .createAutomaticAssignment(

                    id_ticket,

                    ticket.id_oficina, 
                    id_usuario

                );


        if (!asignacion) {

            throw new Error(
                'No se pudo crear la asignación para atención directa'
            );

        }


        // =================================
        // AUDITORÍA
        // =================================

        await auditoriaService.registrarAuditoria({

            id_usuario,

            id_ciudadano:
                ticket.id_ciudadano,

            accion:
                'SELECCION_MODALIDAD_ATENCION_DIRECTA',

            tabla_afectada:
                'tickets',

            registro_afectado:
                id_ticket,

            valores_modificados: {

                modalidad_atencion:
                    modalidad,

                id_asignacion:
                    asignacion.id_asignacion

            }

        });


        // =================================
        // COMUNICACIÓN
        // =================================

        await comunicacionesService
            .createCommunication({

                id_ticket,

                tipo_emisor:
                    'SISTEMA',

                id_usuario:
                    null,

                id_ciudadano:
                    ticket.id_ciudadano,

                mensaje:
                    `El ticket ${ticket.codigo_ticket} fue seleccionado para atención directa y asignado automáticamente a la oficina responsable.`

            });


        return {

            modalidad,

            ticket:
                ticketActualizado,

            asignacion

        };

    }


    // =====================================
    // SOLICITUD ADMINISTRATIVA
    // =====================================

    if (
        modalidad ===
        'SOLICITUD_ADMINISTRATIVA'
    ) {

        // =================================
        // CREAR SAIU
        // =================================

        const saiu =
            await solicitudesIncidenciasService
                .createSAIU({

                    id_ticket,

                    id_usuario,

                    id_oficina:
                        ticket.id_oficina

                });


        if (!saiu) {

            throw new Error(
                'No se pudo generar el SAIU'
            );

        }


        // =================================
        // AUDITORÍA
        // =================================

        await auditoriaService.registrarAuditoria({

            id_usuario,

            id_ciudadano:
                ticket.id_ciudadano,

            accion:
                'GENERACION_SAIU',

            tabla_afectada:
                'tickets',

            registro_afectado:
                id_ticket,

            valores_modificados: {

                modalidad_atencion:
                    modalidad,

                id_saiu:
                    saiu.id_saiu,

                codigo_saiu:
                    saiu.codigo_saiu

            }

        });


        // =================================
        // COMUNICACIÓN
        // =================================

        await comunicacionesService
            .createCommunication({

                id_ticket,

                tipo_emisor:
                    'SISTEMA',

                id_usuario:
                    null,

                id_ciudadano:
                    ticket.id_ciudadano,

                mensaje:
                    `Se generó la Solicitud de Atención de Incidencia Urbana ${saiu.codigo_saiu}. El trámite queda pendiente del registro del expediente.`

            });


        return {

            modalidad,

            ticket:
                ticketActualizado,

            saiu

        };

    }

};
// =====================================
// Exportar
// =====================================

module.exports = {

    createTicketFromIncident,

    findById,

    findByIncidencia,

    findAll,

    assignTicket,

    startAttention,

    resolveTicket,

    closeTicket,

    selectAttentionMode

};

