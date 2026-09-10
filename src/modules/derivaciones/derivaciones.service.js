const repository =
    require('./derivaciones.repository');

const asignacionesService =
    require('../asignaciones/asignaciones.service');

const seguimientoService =
    require('../seguimiento_ticket/seguimiento.service');

const atencionesRepository =
    require('../atenciones/atenciones.repository');

const auditoriaService =
    require('../auditoria/auditoria.service');

const comunicacionesService =
    require('../comunicaciones/comunicaciones.service');

const notificacionesService =
    require('../notificaciones/notificaciones.service');
const createDerivation = async (data) => {


    const {
        id_atencion,
        id_oficina_destino,
        id_usuario,
        id_motivo,
        comentario
    } = data;


    // =====================================
    // BUSCAR ATENCIÓN
    // =====================================

    const atencion =
        await atencionesRepository.findById(
            id_atencion
        );



    if (!atencion) {

        throw new Error(
            'La atención no existe'
        );

    }


    // =====================================
    // VALIDAR ATENCIÓN ACTIVA
    // =====================================


    if (atencion.fecha_fin) {

        throw new Error(
            'La atención ya fue finalizada'
        );

    }


    // =====================================
    // OBTENER TICKET
    // =====================================

    const id_ticket =
        atencion.id_ticket;

    // =====================================
    // BUSCAR TICKET Y ASIGNACIÓN ACTUAL
    // =====================================

    const ticket =
        await repository.findTicketForDerivation(
            id_ticket
        );


    if (!ticket) {

        throw new Error(
            'El ticket no existe o no tiene una asignación activa'
        );

    }


    // =====================================
    // VALIDAR ESTADO
    // =====================================


    if (
        ticket.estado_ticket === 'Cerrado' ||
        ticket.estado_ticket === 'Resuelto'
    ) {

        throw new Error(
            'No se puede derivar un ticket finalizado'
        );

    }


    // =====================================
    // VALIDAR OFICINA
    // =====================================

    const oficinaDestino =
        await repository.findOfficeById(
            id_oficina_destino
        );



    if (!oficinaDestino) {

        throw new Error(
            'La oficina destino no existe'
        );

    }


    if (
        Number(ticket.id_oficina) ===
        Number(id_oficina_destino)
    ) {

        throw new Error(
            'La oficina destino debe ser diferente a la oficina actual'
        );

    }



    // =====================================
    // VALIDAR MOTIVO
    // =====================================

    const motivo =
        await repository.findMotivoById(
            id_motivo
        );



    if (!motivo) {

        throw new Error(
            'El motivo de derivación no existe'
        );

    }


    // =====================================
    // FINALIZAR ATENCIÓN
    // =====================================

    const atencionFinalizada =
        await atencionesRepository
            .finishAttentionByDerivation({

                id_atencion,

                resultado:
                    'La atención fue derivada a otra oficina.',

                conclusion:
                    comentario ||
                    'La atención no pudo ser resuelta por la oficina actual y fue derivada.'

            });




    if (!atencionFinalizada) {

        throw new Error(
            'No se pudo finalizar la atención'
        );

    }


    // =====================================
    // FINALIZAR ASIGNACIÓN ACTUAL
    // =====================================


    const asignacionFinalizada =
        await asignacionesService
            .finishAssignmentFromAttention(

                atencion.id_asignacion,

                comentario ||
                'Asignación finalizada por derivación.',

                id_usuario

            );



    if (!asignacionFinalizada) {

        throw new Error(
            'No se pudo finalizar la asignación actual'
        );

    }


    // =====================================
    // ESTADO DERIVADO
    // =====================================

    const estadoDerivado =
        await repository.findStateByName(
            'TICKET',
            'Derivado'
        );



    if (!estadoDerivado) {

        throw new Error(
            'No existe el estado Derivado'
        );

    }


    // =====================================
    // CREAR DERIVACIÓN
    // =====================================

    const derivacion =
        await repository.create({

            id_ticket,

            oficina_origen:
                ticket.id_oficina,

            oficina_destino:
                id_oficina_destino,

            id_usuario,

            id_motivo,

            comentario

        });




    if (!derivacion) {

        throw new Error(
            'No se pudo registrar la derivación'
        );

    }


    // =====================================
    // CAMBIAR TICKET
    // =====================================


    const ticketDerivado =
        await repository.updateTicketStatus(
            id_ticket,
            estadoDerivado.id_estado
        );



    if (!ticketDerivado) {

        throw new Error(
            'No se pudo cambiar el estado del ticket a Derivado'
        );

    }


    // =====================================
    // NUEVA ASIGNACIÓN
    // =====================================


    const nuevaAsignacion =
        await asignacionesService
            .createAssignmentFromDerivation(

                id_ticket,

                id_oficina_destino,

                id_usuario

            );




    if (!nuevaAsignacion) {

        throw new Error(
            'No se pudo crear la nueva asignación'
        );

    }


    // =====================================
    // SEGUIMIENTO
    // =====================================

    await seguimientoService.createTracking({

        id_ticket,

        id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        origen:
            'USUARIO',

        accion:
            'DERIVACION_TICKET',

        id_estado_anterior:
            ticket.id_estado_ticket,

        id_estado_nuevo:
            estadoDerivado.id_estado,

        comentario:
            comentario ||
            'El ticket fue derivado a una nueva oficina para continuar con su atención.'

    });

    // =====================================
    // AUDITORÍA
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        accion:
            'DERIVACION_TICKET',

        tabla_afectada:
            'derivaciones',

        registro_afectado:
            derivacion.id_derivacion,

        valores_modificados: {

            id_ticket,

            id_atencion,

            asignacion_anterior:
                atencion.id_asignacion,

            nueva_asignacion:
                nuevaAsignacion.id_asignacion,

            oficina_origen:
                ticket.id_oficina,

            oficina_destino:
                id_oficina_destino,

            motivo:
                id_motivo,

            comentario:
                comentario || null

        }

    });


    // =====================================
    // COMUNICACIÓN
    // =====================================


    await comunicacionesService
        .createCommunication({

            id_ticket,

            tipo_emisor:
                'USUARIO',

            id_usuario,

            id_ciudadano:
                atencion.id_ciudadano || null,

            mensaje:
                comentario ||
                'El ticket fue derivado a otra oficina para continuar con su atención.'

        });



    // =====================================
    // NOTIFICACIÓN
    // =====================================


    await notificacionesService
        .createNotification({

            id_ticket,

            id_incidencia:
                atencion.id_incidencia,

            id_ciudadano:
                atencion.id_ciudadano,

            id_tipo_notificacion:
                1,

            mensaje:
                `Tu ticket ${ticket.codigo_ticket} fue derivado a otra oficina para continuar con su atención.`

        });


    // =====================================
    // RESULTADO
    // =====================================


    return {

        derivacion,

        atencion:
            atencionFinalizada,

        asignacionFinalizada,

        nuevaAsignacion,

        ticket:
            await repository.findTicketForDerivation(
                id_ticket
            )

    };

};

module.exports = {

createDerivation

};