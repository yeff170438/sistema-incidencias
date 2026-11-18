
    const repository =
        require('./incidencias.repository');

    const ticketsService =
        require('../tickets/tickets.service');

    const asignacionesService =
        require('../asignaciones/asignaciones.service');

    const auditoriaService =
        require('../auditoria/auditoria.service');

    const comunicacionesService =
    require('../comunicaciones/comunicaciones.service');

    const notificacionesService =
        require('../notificaciones/notificaciones.service');


// =====================================
// Generar código de incidencia
// =====================================

const generateCode = () => {

    const fecha = new Date();

    return (

        'INC-' +

        fecha.getFullYear() +

        String(fecha.getMonth() + 1).padStart(2, '0') +

        String(fecha.getDate()).padStart(2, '0') +

        '-' +

        Date.now().toString().slice(-6)

    );

};


// =====================================
// Obtener incidencia o lanzar excepción
// =====================================

const getIncidentOrThrow = async (
    id_incidencia
) => {

    const incidencia =
        await repository.findById(
            id_incidencia
        );

    if (!incidencia) {

        throw new Error(
            'La incidencia no existe'
        );

    }

    return incidencia;

};


// =====================================
// CREAR INCIDENCIA
// =====================================

const create = async (data) => {

    // =====================================
    // Validar categoría
    // =====================================

    const categoria =
        await repository.findCategoryById(
            data.id_categoria
        );

    if (!categoria) {

        throw new Error(
            'La categoría no existe'
        );

    }


    // =====================================
    // Validar sector
    // =====================================

    if (
        data.id_sector !== undefined &&
        data.id_sector !== null &&
        data.id_sector !== ''
    ) {

        const sector =
            await repository.findSectorById(
                data.id_sector
            );

        if (!sector) {

            throw new Error(
                'El sector no existe'
            );

        }

    }


    // =====================================
    // Generar código
    // =====================================

    data.codigo_incidencia =
        generateCode();


    // =====================================
    // Crear incidencia
    // =====================================

    const incidencia =
        await repository.create(
            data
        );


    // =====================================
    // Registrar auditoría
    // =====================================


    await auditoriaService.registrarAuditoria({

        id_usuario:
            null,

        id_ciudadano:
            data.id_ciudadano,

        accion:
            'CREACION_INCIDENCIA',

        tabla_afectada:
            'incidencias',

        registro_afectado:
            incidencia.id_incidencia,

        valores_modificados: {

            codigo_incidencia:
                incidencia.codigo_incidencia,

            id_categoria:
                incidencia.id_categoria,

            id_sector:
                incidencia.id_sector,

            titulo:
                incidencia.titulo,

            estado:
                'Pendiente'

        }

    });


    // =====================================
    // Registrar notificación
    // =====================================
   
    await notificacionesService.createNotification({

        id_incidencia:
            incidencia.id_incidencia,

        id_ciudadano:
            data.id_ciudadano,

        mensaje:
            `Tu incidencia ${incidencia.codigo_incidencia} fue registrada correctamente y se encuentra pendiente de validación.`

    });
 

    // =====================================
    // Retornar incidencia
    // =====================================

    return incidencia;

};


// =====================================
// Buscar incidencias de un ciudadano
// =====================================

const findByCitizen = async (
    id_ciudadano
) => {

    return await repository.findByCitizen(
        id_ciudadano
    );

};


// =====================================
// Buscar incidencia por ID
// =====================================

const findById = async (
    id,
    id_ciudadano
) => {

    const incidencia =
        await repository.findById(
            id
        );

    if (!incidencia) {

        throw new Error(
            'Incidencia no encontrada'
        );

    }

    if (
        incidencia.id_ciudadano !==
        id_ciudadano
    ) {

        throw new Error(
            'No tiene permiso para consultar esta incidencia'
        );

    }

    return incidencia;

};


// =====================================
// Listar incidencias pendientes
// =====================================

const findPending = async () => {

    return await repository.findPending();

};

// =====================================
// Listar incidencias para gestión
// =====================================

const findForManagement = async () => {

    return await repository.findForManagement();

};

    // =====================================
    // APROBAR INCIDENCIA
    // =====================================

    // =====================================
    // VALIDAR / APROBAR INCIDENCIA
    // =====================================

    const validateIncident = async (
        id_incidencia,
        id_usuario = null
    ) => {
console.log(
    'VALIDATE INCIDENT:',
    {
        id_incidencia,
        id_usuario
    }
);
        // =====================================
        // Buscar incidencia
        // =====================================

        const incidencia =
            await getIncidentOrThrow(
                id_incidencia
            );


        // =====================================
        // Validar estado actual
        // =====================================

        if (
            incidencia.estado !==
            'Pendiente'
        ) {

            throw new Error(
                'Solo se pueden validar incidencias pendientes'
            );

        }


        // =====================================
        // Buscar estado Validada
        // =====================================
        
        const estado =
            await repository.findStateByName(

                'INCIDENCIA',

                'Validada'

            );

        if (!estado) {

            throw new Error(
                'No existe el estado Validada'
            );

        }


        // =====================================
        // Cambiar estado de incidencia
        // =====================================

        const actualizada =
            await repository.updateStatus(

                incidencia.id_incidencia,

                estado.id_estado

            );


        if (!actualizada) {

            throw new Error(
                'No se pudo validar la incidencia'
            );

        }


        // =====================================
        // Crear ticket
        // =====================================
        const ticket =
            await ticketsService.createTicketFromIncident(

                incidencia.id_incidencia,
                id_usuario

            );


        if (!ticket) {

            throw new Error(
                'No se pudo crear el ticket'
            );

        }


        // =====================================
        // Registrar comunicación
        // =====================================
        await comunicacionesService.createCommunication({

            id_ticket:
                ticket.id_ticket,

            tipo_emisor:
                'SISTEMA',

            id_usuario:
                null,

            id_ciudadano:
                incidencia.id_ciudadano,

            mensaje:
                `La incidencia ${incidencia.codigo_incidencia} fue validada y se generó el ticket ${ticket.codigo_ticket}. El ticket queda pendiente de definir la modalidad de atención.`

        });


        // =====================================
        // Registrar auditoría
        // =====================================

        await auditoriaService.registrarAuditoria({

            id_usuario:
                id_usuario,

            id_ciudadano:
                incidencia.id_ciudadano,

            accion:
                'VALIDACION_INCIDENCIA',

            tabla_afectada:
                'incidencias',

            registro_afectado:
                incidencia.id_incidencia,

            valores_modificados: {

                estado_anterior:
                    incidencia.estado,

                estado_nuevo:
                    'Validada',

                id_ticket:
                    ticket.id_ticket,

                codigo_ticket:
                    ticket.codigo_ticket

            }

        });


        // =====================================
        // Retornar resultado
        // =====================================

        return {

            incidencia:
                await repository.findById(
                    id_incidencia
                ),

            ticket

        };

    };


// =====================================
// OBSERVAR INCIDENCIA
// =====================================

const observeIncident = async (data) => {

    const {

        id_incidencia,

        id_usuario,

        id_motivo,

        comentario

    } = data;


    // =====================================
    // Buscar incidencia
    // =====================================

    const incidencia =
        await getIncidentOrThrow(
            id_incidencia
        );


    // =====================================
    // Validar estado actual
    // =====================================

    if (
        incidencia.estado !==
        'Pendiente'
    ) {

        throw new Error(
            'Solo se pueden observar incidencias pendientes'
        );

    }


    // =====================================
    // Buscar estado Observada
    // =====================================

    const estado =
        await repository.findStateByName(

            'INCIDENCIA',

            'Observada'

        );

    if (!estado) {

        throw new Error(
            'No existe el estado Observada'
        );

    }


    // =====================================
    // Guardar observación
    // =====================================

    const observacion =
        await repository.createObservation({

            id_incidencia,

            id_usuario,

            id_motivo,

            comentario

        });


    // =====================================
    // Cambiar estado incidencia
    // =====================================

    await repository.updateStatus(

        id_incidencia,

        estado.id_estado

    );


    // =====================================
    // Registrar historial
    // =====================================

    await repository.createTracking({

        id_incidencia,

        id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        id_estado_anterior:
            incidencia.id_estado,

        id_estado_nuevo:
            estado.id_estado,

        origen:
            'USUARIO',

        accion:
            'OBSERVACION_INCIDENCIA',

        comentario

    });


    // =====================================
    // Registrar auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        accion:
            'OBSERVACION_INCIDENCIA',

        tabla_afectada:
            'incidencias',

        registro_afectado:
            id_incidencia,

        valores_modificados: {

            estado_anterior:
                incidencia.estado,

            estado_nuevo:
                'Observada',

            id_motivo:
                id_motivo,

            comentario:
                comentario

        }

    });


    // =====================================
    // Registrar notificación
    // =====================================

    await notificacionesService.createNotification({

        id_incidencia:
            incidencia.id_incidencia,

        id_ciudadano:
            incidencia.id_ciudadano,

        id_tipo_notificacion:
            1,

        mensaje:
            `Tu incidencia ${incidencia.codigo_incidencia} fue observada. Revisa las observaciones registradas para poder corregirla.`

    });


    return observacion;

};


// =====================================
// CORREGIR INCIDENCIA OBSERVADA
// =====================================

const correctIncident = async (data) => {

    const {

        id_incidencia,

        id_ciudadano,

        id_categoria,

        id_sector,

        titulo,

        descripcion,

        direccion_texto,

        referencia,

        longitud,

        latitud

    } = data;


    // =====================================
    // Buscar incidencia
    // =====================================

    const incidencia =
        await repository.findById(
            id_incidencia
        );

    if (!incidencia) {

        throw new Error(
            'La incidencia no existe'
        );

    }


    // =====================================
    // Validar propietario
    // =====================================

    if (
        incidencia.id_ciudadano !==
        id_ciudadano
    ) {

        throw new Error(
            'No puede modificar esta incidencia'
        );

    }


    // =====================================
    // Validar estado
    // =====================================

    if (
        incidencia.estado !==
        'Observada'
    ) {

        throw new Error(
            'Solo se pueden corregir incidencias observadas'
        );

    }


    // =====================================
    // Validar categoría
    // =====================================

    const categoria =
        await repository.findCategoryById(
            id_categoria
        );

    if (!categoria) {

        throw new Error(
            'La categoría no existe'
        );

    }


    // =====================================
    // Validar sector
    // =====================================

    if (id_sector) {

        const sector =
            await repository.findSectorById(
                id_sector
            );

        if (!sector) {

            throw new Error(
                'El sector no existe'
            );

        }

    }


    // =====================================
    // Buscar estado Pendiente
    // =====================================

    const estadoPendiente =
        await repository.findStateByName(

            'INCIDENCIA',

            'Pendiente'

        );

    if (!estadoPendiente) {

        throw new Error(
            'No existe el estado Pendiente'
        );

    }


    // =====================================
    // Actualizar incidencia
    // =====================================

    const actualizada =
        await repository.updateCorrection({

            id_incidencia,

            id_categoria,

            id_sector,

            titulo,

            descripcion,

            direccion_texto,

            referencia,

            longitud,

            latitud,

            id_estado:
                estadoPendiente.id_estado

        });


    // =====================================
    // Registrar seguimiento
    // =====================================

    await repository.createTracking({

        id_incidencia,

        id_usuario:
            null,

        id_ciudadano,

        id_estado_anterior:
            incidencia.id_estado,

        id_estado_nuevo:
            estadoPendiente.id_estado,

        origen:
            'CIUDADANO',

        accion:
            'CORRECCION_INCIDENCIA',

        comentario:
            'El ciudadano corrigió la información solicitada.'

    });


    // =====================================
    // Registrar auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            null,

        id_ciudadano:
            id_ciudadano,

        accion:
            'CORRECCION_INCIDENCIA',

        tabla_afectada:
            'incidencias',

        registro_afectado:
            id_incidencia,

        valores_modificados: {

            estado_anterior:
                incidencia.estado,

            estado_nuevo:
                'Pendiente',

            id_categoria_anterior:
                incidencia.id_categoria,

            id_categoria_nuevo:
                id_categoria,

            id_sector_anterior:
                incidencia.id_sector,

            id_sector_nuevo:
                id_sector,

            titulo:
                titulo,

            descripcion:
                descripcion,

            direccion_texto:
                direccion_texto,

            referencia:
                referencia

        }

    });





    return actualizada;

};


// =====================================
// RECHAZAR INCIDENCIA
// =====================================

const rejectIncident = async (
    id_incidencia,
    id_usuario
) => {

    // =====================================
    // Buscar incidencia
    // =====================================

    const incidencia =
        await getIncidentOrThrow(
            id_incidencia
        );


    // =====================================
    // Validar estado actual
    // =====================================

    if (
        incidencia.estado !==
        'Pendiente'
    ) {

        throw new Error(
            'Solo se pueden rechazar incidencias pendientes'
        );

    }


    // =====================================
    // Buscar estado Rechazada
    // =====================================

    const estado =
        await repository.findStateByName(

            'INCIDENCIA',

            'Rechazada'

        );

    if (!estado) {

        throw new Error(
            'No existe el estado Rechazada'
        );

    }


    // =====================================
    // Actualizar estado
    // =====================================

    const resultado =
        await repository.updateStatus(

            incidencia.id_incidencia,

            estado.id_estado

        );

    if (!resultado) {

        throw new Error(
            'No se pudo rechazar la incidencia'
        );

    }


    // =====================================
    // Registrar auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        accion:
            'RECHAZO_INCIDENCIA',

        tabla_afectada:
            'incidencias',

        registro_afectado:
            incidencia.id_incidencia,

        valores_modificados: {

            id_incidencia:
                incidencia.id_incidencia,

            estado_anterior:
                incidencia.estado,

            estado_nuevo:
                'Rechazada'

        }

    });


    // =====================================
    // Registrar notificación
    // =====================================

    await notificacionesService.createNotification({

        id_incidencia:
            incidencia.id_incidencia,

        id_ciudadano:
            incidencia.id_ciudadano,

        id_tipo_notificacion:
            1,

        mensaje:
            `Tu incidencia ${incidencia.codigo_incidencia} fue rechazada.`

    });


    // =====================================
    // Retornar incidencia actualizada
    // =====================================

    return await repository.findById(

        incidencia.id_incidencia

    );

};


 // =====================================
 // EDICIÓN ADMINISTRATIVA DE INCIDENCIA
 // =====================================

const adminEditIncident = async (data) => {

    const {
        id_incidencia,
        id_usuario,
        id_categoria,
        id_sector,
        titulo,
        descripcion,
        direccion_texto,
        referencia,
        longitud,
        latitud
    } = data;

    // =====================================
    // BUSCAR INCIDENCIA
    // =====================================

    const incidencia = await getIncidentOrThrow(
        id_incidencia
    );

    // =====================================
    // VALIDAR ESTADO ACTUAL
    // =====================================

    if (
        !['Pendiente', 'Observada'].includes(
            incidencia.estado
        )
    ) {
        throw new Error(
            'Solo se pueden editar incidencias pendientes u observadas'
        );
    }

    // =====================================
    // VERIFICAR QUE NO TENGA TICKET
    // =====================================

    const ticket =
        await ticketsService.findByIncidencia(
            id_incidencia
        );

    if (ticket) {
        throw new Error(
            'No se puede editar una incidencia que ya tiene un ticket asociado'
        );
    }

    // =====================================
    // VALIDAR CATEGORÍA
    // =====================================

    const categoria =
        await repository.findCategoryById(
            Number(id_categoria)
        );

    if (!categoria) {
        throw new Error(
            'La categoría no existe'
        );
    }

    // =====================================
    // NORMALIZAR Y VALIDAR SECTOR
    // =====================================

    const idSectorFinal =
        id_sector === undefined ||
        id_sector === null ||
        id_sector === ''
            ? null
            : Number(id_sector);

    if (idSectorFinal !== null) {

        if (
            !Number.isInteger(idSectorFinal) ||
            idSectorFinal <= 0
        ) {
            throw new Error(
                'El sector debe ser válido'
            );
        }

        const sector =
            await repository.findSectorById(
                idSectorFinal
            );

        if (!sector) {
            throw new Error(
                'El sector no existe'
            );
        }
    }

    // =====================================
    // DETERMINAR ESTADO FINAL
    // =====================================

    let id_estado_final = incidencia.id_estado;

    if (incidencia.estado === 'Observada') {

        const estadoPendiente =
            await repository.findStateByName(
                'INCIDENCIA',
                'Pendiente'
            );

        if (!estadoPendiente) {
            throw new Error(
                'No existe el estado Pendiente'
            );
        }

        id_estado_final =
            estadoPendiente.id_estado;
    }

    // =====================================
    // ACTUALIZAR INCIDENCIA
    // =====================================

    const actualizada =
        await repository.updateCorrection({

            id_incidencia,

            id_categoria: Number(id_categoria),

            id_sector: idSectorFinal,

            titulo: titulo.trim(),

            descripcion: descripcion.trim(),

            direccion_texto:
                direccion_texto.trim(),

            referencia:
                referencia == null
                    ? null
                    : referencia.trim(),

            longitud: Number(longitud),

            latitud: Number(latitud),

            id_estado: id_estado_final

        });

    if (!actualizada) {
        throw new Error(
            'No se pudo actualizar la incidencia'
        );
    }

    // =====================================
    // REGISTRAR SEGUIMIENTO
    // =====================================

    await repository.createTracking({

        id_incidencia:
            incidencia.id_incidencia,

        id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        id_estado_anterior:
            incidencia.id_estado,

        id_estado_nuevo:
            id_estado_final,

        origen:
            'USUARIO',

        accion:
            'EDICION_ADMINISTRATIVA_INCIDENCIA',

        comentario:
            'El administrador corrigió los datos de la incidencia antes de la generación del ticket.'

    });

    // =====================================
    // REGISTRAR AUDITORÍA
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario,

        id_ciudadano:
            incidencia.id_ciudadano,

        accion:
            'EDICION_ADMINISTRATIVA_INCIDENCIA',

        tabla_afectada:
            'incidencias',

        registro_afectado:
            incidencia.id_incidencia,

        valores_modificados: {

            antes: {
                titulo: incidencia.titulo,
                descripcion: incidencia.descripcion,
                id_categoria: incidencia.id_categoria,
                id_sector: incidencia.id_sector,
                direccion_texto:
                    incidencia.direccion_texto,
                referencia: incidencia.referencia,
                longitud: incidencia.longitud,
                latitud: incidencia.latitud,
                estado: incidencia.estado
            },

            despues: {
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                id_categoria: Number(id_categoria),
                id_sector: idSectorFinal,
                direccion_texto:
                    direccion_texto.trim(),
                referencia:
                    referencia == null
                        ? null
                        : referencia.trim(),
                longitud: Number(longitud),
                latitud: Number(latitud),
                estado:
                    incidencia.estado === 'Observada'
                        ? 'Pendiente'
                        : incidencia.estado
            }

        }

    });

    // =====================================
    // RETORNAR INCIDENCIA ACTUALIZADA
    // =====================================

    return await repository.findById(
        id_incidencia
    );

};

// =====================================
// EXPORTAR SERVICIOS
// =====================================

module.exports = {

    create,

    findByCitizen,

    findById,

    findPending,

    findForManagement,

    validateIncident,

    observeIncident,

    correctIncident,

    rejectIncident,

    adminEditIncident

};
