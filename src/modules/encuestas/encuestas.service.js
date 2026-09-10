const repository =
    require('./encuestas.repository');


const seguimientoService =
    require('../seguimiento_ticket/seguimiento.service');


const auditoriaService =
    require('../auditoria/auditoria.service');


const comunicacionesService =
    require('../comunicaciones/comunicaciones.service');


const notificacionesService =
    require('../notificaciones/notificaciones.service');


// =====================================
// Obtener encuesta o lanzar excepción
// =====================================

const getSurveyOrThrow = async (
    id_encuesta
) => {

    const encuesta =
        await repository.findById(
            id_encuesta
        );

    if (!encuesta) {

        throw new Error(
            'La encuesta no existe'
        );

    }

    return encuesta;

};


// =====================================
// CREAR ENCUESTA
// Se ejecuta cuando el ticket fue cerrado
// =====================================

const createSurvey = async (
    id_ticket
) => {

    // =====================================
    // Verificar si ya existe
    // =====================================

    const existe =
        await repository.existsByTicket(
            id_ticket
        );

    if (existe) {

        throw new Error(
            'El ticket ya tiene una encuesta'
        );  

    }


    // =====================================
    // Obtener ticket
    // =====================================

    const ticket =
        await repository.findTicketForSurvey(
            id_ticket
        );

    if (!ticket) {

        throw new Error(
            'El ticket no existe'
        );

    }


    // =====================================
    // Validar ciclo de vida
    // =====================================

    if (
        ticket.estado_ticket !==
        'Cerrado'
    ) {

        throw new Error(
            'Solo se puede crear una encuesta cuando el ticket está cerrado'
        );

    }


    // =====================================
    // Validar ciudadano
    // =====================================

    if (!ticket.id_ciudadano) {

        throw new Error(
            'El ticket no tiene un ciudadano asociado'
        );

    }


    // =====================================
    // Buscar estado Pendiente
    // =====================================

    const estado =
        await repository.findStateByName(
            'Pendiente'
        );

    if (!estado) {

        throw new Error(
            'No existe el estado Pendiente para encuestas'
        );

    }


    // =====================================
    // Crear encuesta
    // =====================================

    const encuesta =
        await repository.create({

            id_ticket,

            id_ciudadano:
                ticket.id_ciudadano,

            id_estado:
                estado.id_estado

        });


    if (!encuesta) {

        throw new Error(
            'No se pudo crear la encuesta'
        );

    }


    // =====================================
    // Registrar seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket,

        id_usuario:
            null,

        id_ciudadano:
            ticket.id_ciudadano,

        origen:
            'SISTEMA',

        accion:
            'CREACION_ENCUESTA',

        id_estado_anterior:
            ticket.id_estado_ticket,

        id_estado_nuevo:
            ticket.id_estado_ticket,

        comentario:
            'Se generó una encuesta de satisfacción ciudadana después del cierre del ticket.'

    });


    // =====================================
    // Registrar auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            null,

        id_ciudadano:
            ticket.id_ciudadano,

        accion:
            'CREACION_ENCUESTA',

        tabla_afectada:
            'encuestas',

        registro_afectado:
            encuesta.id_encuesta,

        valores_modificados: {

            id_ticket,

            id_ciudadano:
                ticket.id_ciudadano,

            estado:
                'Pendiente'

        }

    });


    // =====================================
    // Comunicación
    // =====================================
    // No generamos comunicación adicional
    // para evitar duplicar información.
    //
    // La encuesta será visible para el
    // ciudadano mediante la aplicación.
    // =====================================


    // =====================================
    // NOTIFICACIÓN CIUDADANO
    // =====================================
    // Esta sí es relevante porque informa
    // que existe una encuesta pendiente.
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
            `Tu ticket ${ticket.codigo_ticket} fue cerrado. Puedes responder una breve encuesta para ayudarnos a mejorar la atención y la aplicación.`

    });


    return encuesta;

};


// =====================================
// OBTENER ENCUESTA
// =====================================

const findById = async (
    id_encuesta
) => {

    return await getSurveyOrThrow(
        id_encuesta
    );

};


// =====================================
// OBTENER ENCUESTA COMPLETA
// Incluye preguntas/respuestas
// =====================================

const findCompleteById = async (
    id_encuesta
) => {

    const encuesta =
        await getSurveyOrThrow(
            id_encuesta
        );


    return await repository.findCompleteById(
        encuesta.id_encuesta
    );

};


// =====================================
// OBTENER ENCUESTAS DEL CIUDADANO
// =====================================

const findByCitizen = async (
    id_ciudadano
) => {

    return await repository.findByCitizen(
        id_ciudadano
    );

};


// =====================================
// OBTENER ENCUESTAS PENDIENTES
// DEL CIUDADANO
// =====================================

const findPendingByCitizen = async (
    id_ciudadano
) => {

    return await repository.findPendingByCitizen(
        id_ciudadano
    );

};


// =====================================
// OBTENER PREGUNTAS ACTIVAS
// =====================================

const findQuestions = async () => {

    return await repository.findQuestions();

};


// =====================================
// RESPONDER ENCUESTA
// =====================================

const answerSurvey = async (
    data
) => {

    const {

        id_encuesta,

        id_ciudadano,

        respuestas

    } = data;


    // =====================================
    // Validar encuesta
    // =====================================

    const encuesta =
        await getSurveyOrThrow(
            id_encuesta
        );


    // =====================================
    // Validar propietario
    // =====================================

    if (
        encuesta.id_ciudadano !==
        id_ciudadano
    ) {

        throw new Error(
            'No tiene permiso para responder esta encuesta'
        );

    }


    // =====================================
    // Validar estado
    // =====================================

    if (
        encuesta.estado !==
        'Pendiente'
    ) {

        throw new Error(
            'La encuesta ya no está disponible para responder'
        );

    }


    // =====================================
    // Validar respuestas
    // =====================================

    if (
        !Array.isArray(respuestas) ||
        respuestas.length === 0
    ) {

        throw new Error(
            'Debe proporcionar las respuestas de la encuesta'
        );

    }


    // =====================================
    // Obtener preguntas activas
    // =====================================

    const preguntas =
        await repository.findQuestions();


    if (
        !preguntas ||
        preguntas.length === 0
    ) {

        throw new Error(
            'No existen preguntas activas para la encuesta'
        );

    }


    // =====================================
    // Verificar preguntas
    // =====================================

    const preguntasMap =
        new Map(

            preguntas.map(
                pregunta => [
                    pregunta.id_pregunta,
                    pregunta
                ]
            )

        );


    // =====================================
    // Evitar preguntas duplicadas
    // =====================================

    const idsPreguntas =
        respuestas.map(
            respuesta =>
                Number(
                    respuesta.id_pregunta
                )
        );


    const idsUnicos =
        new Set(idsPreguntas);


    if (
        idsUnicos.size !==
        idsPreguntas.length
    ) {

        throw new Error(
            'No se puede responder una misma pregunta más de una vez'
        );

    }


    // =====================================
    // Validar preguntas recibidas
    // =====================================

    for (
        const respuesta of respuestas
    ) {

        const pregunta =
            preguntasMap.get(
                Number(
                    respuesta.id_pregunta
                )
            );


        if (!pregunta) {

            throw new Error(
                `La pregunta ${respuesta.id_pregunta} no existe o no está activa`
            );

        }


        // =================================
        // CALIFICACION
        // =================================

        if (
            pregunta.tipo_respuesta ===
            'CALIFICACION'
        ) {

            const valor =
                Number(
                    respuesta.respuesta_valor
                );


            if (
                !Number.isInteger(valor) ||
                valor < 1 ||
                valor > 5
            ) {

                throw new Error(
                    `La respuesta de la pregunta ${pregunta.id_pregunta} debe ser una calificación entre 1 y 5`
                );

            }

        }


        // =================================
        // TEXTO
        // =================================

        if (
            pregunta.tipo_respuesta ===
            'TEXTO'
        ) {

            if (
                pregunta.obligatoria &&
                (
                    !respuesta.respuesta_texto ||
                    !respuesta.respuesta_texto.trim()
                )
            ) {

                throw new Error(
                    `La pregunta ${pregunta.id_pregunta} requiere una respuesta`
                );

            }

        }

    }


    // =====================================
    // Verificar preguntas obligatorias
    // =====================================

    for (
        const pregunta of preguntas
    ) {

        if (
            !pregunta.obligatoria
        ) {

            continue;

        }


        const respondida =
            respuestas.find(

                respuesta =>
                    Number(
                        respuesta.id_pregunta
                    ) ===
                    Number(
                        pregunta.id_pregunta
                    )

            );


        if (!respondida) {

            throw new Error(
                `Debe responder la pregunta ${pregunta.id_pregunta}`
            );

        }

    }


    // =====================================
    // Crear respuestas
    // =====================================

    const respuestasGuardadas = [];


    for (
        const respuesta of respuestas
    ) {

        const guardada =
            await repository.createAnswer({

                id_encuesta,

                id_pregunta:
                    respuesta.id_pregunta,

                respuesta_valor:
                    respuesta.respuesta_valor ||
                    null,

                respuesta_texto:
                    respuesta.respuesta_texto ||
                    null

            });


        respuestasGuardadas.push(
            guardada
        );

    }


    // =====================================
    // Buscar estado Respondida
    // =====================================

    const estadoRespondida =
        await repository.findStateByName(
            'Respondida'
        );


    if (!estadoRespondida) {

        throw new Error(
            'No existe el estado Respondida'
        );

    }


    // =====================================
    // Cambiar estado
    // =====================================

    const encuestaActualizada =
        await repository.updateStatus(

            id_encuesta,

            estadoRespondida.id_estado

        );


    // =====================================
    // Registrar seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket:
            encuesta.id_ticket,

        id_usuario:
            null,

        id_ciudadano:
            id_ciudadano,

        origen:
            'CIUDADANO',

        accion:
            'RESPUESTA_ENCUESTA',

        id_estado_anterior:
            encuesta.id_estado,

        id_estado_nuevo:
            estadoRespondida.id_estado,

        comentario:
            'El ciudadano respondió la encuesta de satisfacción.'

    });


    // =====================================
    // Registrar auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            null,

        id_ciudadano,

        accion:
            'RESPUESTA_ENCUESTA',

        tabla_afectada:
            'encuestas',

        registro_afectado:
            id_encuesta,

        valores_modificados: {

            estado_anterior:
                'Pendiente',

            estado_nuevo:
                'Respondida',

            cantidad_respuestas:
                respuestasGuardadas.length

        }

    });


    // =====================================
    // Comunicación
    // =====================================
    // No necesitamos crear comunicación:
    // la respuesta ya queda registrada
    // como parte de la encuesta.
    // =====================================


    return {

        encuesta:
            encuestaActualizada,

        respuestas:
            respuestasGuardadas

    };

};


// =====================================
// EXPIRAR ENCUESTA
// =====================================

const expireSurvey = async (
    id_encuesta
) => {

    const encuesta =
        await getSurveyOrThrow(
            id_encuesta
        );


    // =====================================
    // Validar estado
    // =====================================

    if (
        encuesta.estado !==
        'Pendiente'
    ) {

        throw new Error(
            'Solo se pueden expirar encuestas pendientes'
        );

    }


    // =====================================
    // Buscar estado Expirada
    // =====================================

    const estadoExpirada =
        await repository.findStateByName(
            'Expirada'
        );


    if (!estadoExpirada) {

        throw new Error(
            'No existe el estado Expirada'
        );

    }


    // =====================================
    // Actualizar estado
    // =====================================

    const resultado =
        await repository.updateStatus(

            id_encuesta,

            estadoExpirada.id_estado

        );


    // =====================================
    // Seguimiento
    // =====================================

    await seguimientoService.createTracking({

        id_ticket:
            encuesta.id_ticket,

        id_usuario:
            null,

        id_ciudadano:
            encuesta.id_ciudadano,

        origen:
            'SISTEMA',

        accion:
            'EXPIRACION_ENCUESTA',

        id_estado_anterior:
            encuesta.id_estado,

        id_estado_nuevo:
            estadoExpirada.id_estado,

        comentario:
            'La encuesta de satisfacción expiró sin recibir respuesta.'

    });


    // =====================================
    // Auditoría
    // =====================================

    await auditoriaService.registrarAuditoria({

        id_usuario:
            null,

        id_ciudadano:
            encuesta.id_ciudadano,

        accion:
            'EXPIRACION_ENCUESTA',

        tabla_afectada:
            'encuestas',

        registro_afectado:
            id_encuesta,

        valores_modificados: {

            estado_anterior:
                'Pendiente',

            estado_nuevo:
                'Expirada'

        }

    });


    // =====================================
    // NO NOTIFICAR
    // =====================================
    // La expiración es un evento interno.
    // No generamos notificación para evitar
    // ruido al ciudadano.
    // =====================================


    return resultado;

};


// =====================================
// ESTADÍSTICAS
// =====================================

const getStatistics = async () => {

    return await repository.getStatistics();

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createSurvey,

    findById,

    findCompleteById,

    findByCitizen,

    findPendingByCitizen,

    findQuestions,

    answerSurvey,

    expireSurvey,

    getStatistics

};