const repository =
    require('./atenciones.repository');

const seguimientoService =
    require('../seguimiento_ticket/seguimiento.service');

const asignacionesService =
    require('../asignaciones/asignaciones.service');

const derivacionesService =
    require('../derivaciones/derivaciones.service');


const auditoriaService =
    require('../auditoria/auditoria.service');

const comunicacionesService =
    require('../comunicaciones/comunicaciones.service');

const notificacionesService =
    require('../notificaciones/notificaciones.service');


// =====================================
// INICIAR ATENCIÓN
// =====================================

const startAttention = async (data) => {

    // =====================================
    // Buscar asignación
    // =====================================

    const asignacion =
        await repository.findAssignmentForAttention(
            data.id_asignacion
        );

    if (!asignacion) {

        throw new Error(
            'La asignación no existe'
        );

    }


    // =====================================
    // Validar estado de asignación
    // =====================================

    if (
        asignacion.estado_asignacion !==
        'Recibida'
    ) {

        throw new Error(
            'La asignación debe estar recibida para iniciar atención'
        );

    }


    // =====================================
    // Verificar atención activa
    // =====================================

    const activa =
        await repository.findActiveByTicket(
            asignacion.id_ticket
        );

    if (activa) {

        throw new Error(
            'El ticket ya tiene una atención en proceso'
        );

    }


    // =====================================
    // Crear atención
    // =====================================

    const atencion =
        await repository.create({

            id_ticket:
                asignacion.id_ticket,

            id_asignacion:
                asignacion.id_asignacion,

            id_oficina:
                asignacion.id_oficina,

            id_usuario:
                data.id_usuario,

            descripcion_atencion:
                data.descripcion_atencion

        });


    if (!atencion) {

        throw new Error(
            'No se pudo crear la atención'
        );

    }


    // =====================================
    // Cambiar asignación
    //
    // Recibida -> En proceso
    //
    // El servicio de asignaciones también
    // cambia el ticket:
    //
    // Asignado -> En Atención
    // =====================================

    const flujo =
        await asignacionesService
            .startAssignmentFromAttention(

                asignacion.id_asignacion,

                data.id_usuario

            );


    if (!flujo) {

        throw new Error(
            'No se pudo iniciar la asignación'
        );

    }


    // =====================================
    // Registrar seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket:
            asignacion.id_ticket,

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            asignacion.id_ciudadano || null,

        origen:
            'USUARIO',

        accion:
            'INICIO_ATENCION',

        id_estado_anterior:
            asignacion.id_estado_ticket,

        id_estado_nuevo:
            flujo.ticket.id_estado,

        comentario:
            'Se inició la atención del ticket.'

    });


    // =====================================
    // Registrar auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            asignacion.id_ciudadano || null,

        accion:
            'INICIO_ATENCION',

        tabla_afectada:
            'atenciones',

        registro_afectado:
            atencion.id_atencion,

        valores_modificados: {

            id_ticket:
                asignacion.id_ticket,

            id_asignacion:
                asignacion.id_asignacion,

            estado_asignacion_anterior:
                'Recibida',

            estado_asignacion_nuevo:
                'En proceso',

            estado_ticket_anterior:
                asignacion.estado_ticket,

            estado_ticket_nuevo:
                'En Atención'

        }

    });


    // =====================================
    // Registrar comunicación
    // =====================================

    await comunicacionesService.createCommunication({

        id_ticket:
            asignacion.id_ticket,

        tipo_emisor:
            'USUARIO',

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            asignacion.id_ciudadano || null,

        mensaje:
            'Se inició la atención del ticket.'

    });


    return atencion;

};


// =====================================
// ACTUALIZAR AVANCE
// =====================================

const updateProgress = async (data) => {

    const atencion =
        await repository.findById(
            data.id_atencion
        );

    if (!atencion) {

        throw new Error(
            'La atención no existe'
        );

    }


    if (atencion.fecha_fin) {

        throw new Error(
            'La atención ya fue finalizada'
        );

    }


    if (!data.descripcion_atencion) {

        throw new Error(
            'Debe ingresar la descripción del avance'
        );

    }


    const resultado =
        await repository.updateProgress(data);


    if (!resultado) {

        throw new Error(
            'No se pudo actualizar el avance'
        );

    }


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket:
            atencion.id_ticket,

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        origen:
            'USUARIO',

        accion:
            'ACTUALIZACION_ATENCION',

        id_estado_anterior:
            atencion.id_estado_ticket,

        id_estado_nuevo:
            atencion.id_estado_ticket,

        comentario:
            'Se actualizó el avance de la atención.'

    });


    // =====================================
    // Auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        accion:
            'ACTUALIZACION_ATENCION',

        tabla_afectada:
            'atenciones',

        registro_afectado:
            atencion.id_atencion,

        valores_modificados: {

            id_ticket:
                atencion.id_ticket,

            id_asignacion:
                atencion.id_asignacion,

            descripcion_atencion:
                data.descripcion_atencion,

            resultado:
                data.resultado || null,

            conclusion:
                data.conclusion || null

        }

    });


    // =====================================
    // Comunicación
    // =====================================

    await comunicacionesService.createCommunication({

        id_ticket:
            atencion.id_ticket,

        tipo_emisor:
            'USUARIO',

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        mensaje:
            data.descripcion_atencion

    });


    return resultado;

};


// =====================================
// FINALIZAR ATENCIÓN
// =====================================

const finishAttention = async (data) => {

    const atencion =
        await repository.findById(
            data.id_atencion
        );

    if (!atencion) {

        throw new Error(
            'La atención no existe'
        );

    }


    if (atencion.fecha_fin) {

        throw new Error(
            'La atención ya fue finalizada'
        );

    }


    // =====================================
    // Validar estado de asignación
    // =====================================

    const asignacion =
        await asignacionesService.findById(
            atencion.id_asignacion
        );

    if (
        !asignacion ||
        asignacion.estado !== 'En proceso'
    ) {

        throw new Error(
            'La asignación debe estar En proceso para finalizar la atención'
        );

    }


    // =====================================
    // Finalizar atención
    // =====================================

    const resultado =
        await repository.finishAttention({

            id_atencion:
                data.id_atencion,

            resultado:
                data.resultado,

            conclusion:
                data.conclusion

        });


    if (!resultado) {

        throw new Error(
            'No se pudo finalizar la atención'
        );

    }


    // =====================================
    // Finalizar asignación
    //
    // En proceso -> Finalizada
    //
    // El servicio de asignaciones también
    // cambia el ticket:
    //
    // En Atención -> Resuelto
    // =====================================

    const flujo =
        await asignacionesService
            .finishAssignmentFromAttention(

                atencion.id_asignacion,

                data.conclusion ||
                'Atención finalizada correctamente.',

                data.id_usuario

            );


    if (!flujo) {

        throw new Error(
            'No se pudo finalizar la asignación'
        );

    }


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket:
            atencion.id_ticket,

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        origen:
            'USUARIO',

        accion:
            'FINALIZACION_ATENCION',

        id_estado_anterior:
            atencion.id_estado_ticket,

        id_estado_nuevo:
            flujo.ticket.id_estado,

        comentario:
            data.conclusion ||
            'La atención fue finalizada.'

    });


    // =====================================
    // Auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        accion:
            'FINALIZACION_ATENCION',

        tabla_afectada:
            'atenciones',

        registro_afectado:
            resultado.id_atencion,

        valores_modificados: {

            id_ticket:
                atencion.id_ticket,

            id_asignacion:
                atencion.id_asignacion,

            id_oficina:
                atencion.id_oficina,

            estado_ticket_anterior:
                atencion.estado_ticket,

            estado_ticket_nuevo:
                'Resuelto',

            resultado:
                data.resultado || null,

            conclusion:
                data.conclusion || null,

            fecha_fin:
                resultado.fecha_fin

        }

    });


    // =====================================
    // Comunicación
    // =====================================

    await comunicacionesService.createCommunication({

        id_ticket:
            atencion.id_ticket,

        tipo_emisor:
            'USUARIO',

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        mensaje:
            data.conclusion ||
            'La atención fue finalizada y el ticket quedó resuelto.'

    });


    // =====================================
    // Notificación ciudadano
    // =====================================

    await notificacionesService.createNotification({

        id_ticket:
            atencion.id_ticket,

        id_incidencia:
            atencion.id_incidencia,

        id_ciudadano:
            atencion.id_ciudadano,

        id_tipo_notificacion:
            1,

        mensaje:
            `La atención de tu ticket ${atencion.codigo_ticket} ha finalizado y el ticket fue marcado como resuelto.`

    });


    return resultado;

};


// =====================================
// BUSCAR ATENCIÓN POR ID
// =====================================

const findById = async (id) => {

    const atencion =
        await repository.findById(id);

    if (!atencion) {

        throw new Error(
            'La atención no existe'
        );

    }

    return atencion;

};


// =====================================
// HISTORIAL DE ATENCIONES
// =====================================

const findByTicket = async (id_ticket) => {

    return await repository.findByTicket(
        id_ticket
    );

};


// =====================================
// DERIVAR ATENCIÓN
// =====================================

const deriveAttention = async (data) => {

    const atencion =
        await repository.findById(
            data.id_atencion
        );

    if (!atencion) {

        throw new Error(
            'La atención no existe'
        );

    }


    if (atencion.fecha_fin) {

        throw new Error(
            'La atención ya fue finalizada'
        );

    }


    const derivacion =
        await derivacionesService.createDerivation({

            id_atencion:
                data.id_atencion,

            id_ticket:
                atencion.id_ticket,

            id_oficina_destino:
                data.id_oficina_destino,

            id_usuario:
                data.id_usuario,

            id_motivo:
                data.id_motivo,

            comentario:
                data.comentario

        });


    return derivacion;

};


// =====================================
// FINALIZAR ATENCIÓN POR DERIVACIÓN
// =====================================

const finishAttentionByDerivation = async (data) => {

    const atencion =
        await repository.findById(
            data.id_atencion
        );

    if (!atencion) {

        throw new Error(
            'La atención no existe'
        );

    }


    if (atencion.fecha_fin) {

        throw new Error(
            'La atención ya fue finalizada'
        );

    }


    const resultado =
        await repository.finishAttentionByDerivation({

            id_atencion:
                data.id_atencion,

            resultado:
                data.resultado,

            conclusion:
                data.conclusion

        });


    if (!resultado) {

        throw new Error(
            'No se pudo finalizar la atención por derivación'
        );

    }


    await comunicacionesService.createCommunication({

        id_ticket:
            atencion.id_ticket,

        tipo_emisor:
            'USUARIO',

        id_usuario:
            data.id_usuario,

        id_ciudadano:
            atencion.id_ciudadano || null,

        mensaje:
            'La atención fue finalizada debido a la derivación del ticket a otra oficina.'

    });


    return resultado;

};


module.exports = {

    startAttention,
    updateProgress,
    finishAttention,
    findById,
    findByTicket,
    deriveAttention,
    finishAttentionByDerivation

};