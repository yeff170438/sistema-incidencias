        const repository = require('./asignaciones.repository');



        const seguimientoService =
        require('../seguimiento_ticket/seguimiento.service');

        const auditoriaService =
            require('../auditoria/auditoria.service');

        const comunicacionesService =
        require('../comunicaciones/comunicaciones.service');

        const notificacionesService =
        require('../notificaciones/notificaciones.service');
        // =====================================
        // Validar transición de estados
        // =====================================

        const validateTransition = (

            estadoActual,

            estadoNuevo

        )=>{


            const transitions = {


                "Pendiente de recepción":[

                    "Recibida",

                    "Rechazada"

                ],


                "Recibida":[

                    "En proceso",

                    "Rechazada"

                ],


                "En proceso":[

                    "Finalizada"

                ],


                "Finalizada":[],

                "Rechazada":[]

            };



            const permitidos =

                transitions[estadoActual] || [];



            if(

                !permitidos.includes(

                    estadoNuevo

                )

            ){

                throw new Error(

                    `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`

                );

            }


        };






        // =====================================
        // Crear asignación
        // =====================================

        const createAssignment = async (data) => {

            const {

                id_ticket,

                id_oficina,

                id_usuario

            } = data;



            // =====================================
            // Verificar ticket
            // =====================================

            const ticket =

                await repository.findTicketForAssignment(

                    id_ticket

                );



            if (!ticket) {

                throw new Error(

                    "El ticket no existe"

                );

            }



            // =====================================
            // Validar estado
            // =====================================

            if (ticket.estado_ticket === "Cerrado") {

                throw new Error(

                    "No se puede asignar un ticket cerrado"

                );

            }



            // =====================================
            // Verificar asignación activa
            // =====================================

            const activa =

                await repository.findActiveByTicket(

                    id_ticket

                );



            if (activa) {

                throw new Error(

                    "El ticket ya tiene una asignación activa"

                );

            }



            // =====================================
            // Estado inicial
            // =====================================

            const estado =

                await repository.findStateByName(

                    "ASIGNACION",

                    "Pendiente de recepción"

                );



            if (!estado) {

                throw new Error(

                    "No existe estado inicial de asignación"

                );

            }



            // =====================================
            // Crear asignación
            // =====================================

            const asignacion =

                await repository.create({

                    id_ticket,

                    id_oficina,

                    id_usuario,

                    id_estado:
                        estado.id_estado

                });



            // =====================================
            // Registrar seguimiento
            // =====================================

            await seguimientoService.createTracking({

                id_ticket,

                id_usuario:
                    null,

                id_ciudadano:
                    null,

                origen:
                    "SISTEMA",

                accion:
                    "ASIGNACION_OFICINA",

                id_estado_anterior:
                    ticket.id_estado_ticket,

                id_estado_nuevo:
                    estado.id_estado,

                comentario:
                    "Ticket asignado automáticamente a la oficina responsable."

            });

        // =====================================
        // Registrar comunicación
        // =====================================

        await comunicacionesService.createCommunication({

            id_ticket:
                id_ticket,

            tipo_emisor:
                "SISTEMA",

            id_usuario:
                id_usuario || null,

            id_ciudadano:
                ticket.id_ciudadano || null,

            mensaje:
                "El ticket fue asignado a la oficina responsable y quedó pendiente de recepción."

        });
        // =====================================
        // Registrar auditoría
        // =====================================

        await auditoriaService.registrarAuditoria({

            id_usuario:
                id_usuario || null,

            id_ciudadano:
                null,

            accion:
                "ASIGNACION_OFICINA",

            tabla_afectada:
                "asignaciones",

            registro_afectado:
                asignacion.id_asignacion,

            valores_modificados: {

                id_ticket:
                    id_ticket,

                id_oficina:
                    id_oficina,

                id_usuario:
                    id_usuario || null,

                estado_nuevo:
                    estado.nombre

            }

        });
            return asignacion;

        };






        // =====================================
        // Obtener asignación
        // =====================================

        const findById = async(id)=>{


            const asignacion =

                await repository.findById(

                    id

                );



            if(!asignacion){


                throw new Error(

                    "Asignación no encontrada"

                );

            }



            return asignacion;


        };






        // =====================================
        // Listar por oficina
        // =====================================

        const findByOffice = async(

            id_oficina

        )=>{


            return await repository.findByOffice(

                id_oficina

            );


        };






        // =====================================
        // Recibir asignación
        // =====================================

        const receiveAssignment = async(

            id_asignacion,

            usuario_receptor,

            id_usuario

        )=>{


            // Buscar asignación

            const asignacion =

                await repository.findById(

                    id_asignacion

                );



            if(!asignacion){


                throw new Error(

                    "Asignación no encontrada"

                );

            }




            // Nuevo estado de asignación

            const estadoNuevo =

                await repository.findStateByName(

                    "ASIGNACION",

                    "Recibida"

                );



            if(!estadoNuevo){


                throw new Error(

                    "No existe estado Recibida"

                );

            }





            // Validar transición

            validateTransition(

                asignacion.estado,

                estadoNuevo.nombre

            );





            // Actualizar asignación

            const resultado =

                await repository.receiveAssignment(

                    id_asignacion,

                    usuario_receptor,

                    estadoNuevo.id_estado

                );






            // =====================================
            // Actualizar estado del ticket
            // =====================================


            const estadoTicket =

                await repository.findStateByName(

                    "TICKET",

                    "Asignado"

                );



            if(!estadoTicket){


                throw new Error(

                    "No existe estado Asignado para ticket"

                );

            }





            await repository.updateTicketStatus(

                asignacion.id_ticket,

                estadoTicket.id_estado

            );






            // =====================================
            // Registrar seguimiento
            // =====================================


            await seguimientoService.createTracking({

                id_ticket:

                    asignacion.id_ticket,


                id_usuario:

                    id_usuario,


                id_ciudadano:

                    null,


                origen:

                    "USUARIO",


                accion:

                    "RECEPCION_ASIGNACION",


                id_estado_anterior:

                    asignacion.id_estado_ticket,


                id_estado_nuevo:

                    estadoTicket.id_estado,


                comentario:

                    "La asignación fue recibida por el responsable."

            });

                    // =====================================
            // Registrar comunicación
            // =====================================

            await comunicacionesService.createCommunication({

                id_ticket:
                    asignacion.id_ticket,

                tipo_emisor:
                    "USUARIO",

                id_usuario:
                    id_usuario,

                id_ciudadano:
                    asignacion.id_ciudadano || null,

                mensaje:
                    "La asignación fue recibida por el responsable."

            });
            // =====================================
            // Registrar auditoría
            // =====================================

            await auditoriaService.registrarAuditoria({

                id_usuario:
                    id_usuario,

                id_ciudadano:
                    null,

                accion:
                    "RECEPCION_ASIGNACION",

                tabla_afectada:
                    "asignaciones",

                registro_afectado:
                    id_asignacion,

                valores_modificados: {

                    id_ticket:
                        asignacion.id_ticket,

                    estado_asignacion_anterior:
                        asignacion.estado,

                    estado_asignacion_nuevo:
                        estadoNuevo.nombre,

                    usuario_receptor:
                        usuario_receptor,

                    estado_ticket_nuevo:
                        estadoTicket.nombre

                }

            });



            return resultado;


        };

        







        

        // =====================================
        // Rechazar asignación
        // =====================================

        const rejectAssignment = async(

            id_asignacion,

            observacion,

            id_usuario

        )=>{


            // =====================================
            // Buscar asignación
            // =====================================

            const asignacion =

                await repository.findById(

                    id_asignacion

                );



            if(!asignacion){

                throw new Error(

                    "Asignación no encontrada"

                );

            }




            // =====================================
            // Buscar estado Rechazada
            // =====================================

            const estado =

                await repository.findStateByName(

                    "ASIGNACION",

                    "Rechazada"

                );



            if(!estado){

                throw new Error(

                    "No existe estado Rechazada"

                );

            }




            // =====================================
            // Validar transición
            // =====================================

            validateTransition(

                asignacion.estado,

                estado.nombre

            );




            // =====================================
            // Rechazar asignación
            // =====================================

            const resultado =

                await repository.rejectAssignment(

                    id_asignacion,

                    estado.id_estado,

                    observacion

                );




            // =====================================
            // Buscar estado Pendiente de asignación
            // =====================================

            const estadoTicket =

                await repository.findStateByName(

                    "TICKET",

                    "Pendiente de asignación"

                );


            if(!estadoTicket){

                throw new Error(

                    "No existe estado Pendiente de asignación"

                );

            }




            // =====================================
            // Actualizar estado del ticket
            // Asignado -> Pendiente de asignación
            // =====================================

            await repository.updateTicketStatus(

                asignacion.id_ticket,

                estadoTicket.id_estado

            );




            // =====================================
            // Registrar seguimiento
            // =====================================

            await seguimientoService.createTracking({

                id_ticket:
                    asignacion.id_ticket,


                id_usuario:
                    id_usuario,


                id_ciudadano:
                    null,


                origen:
                    "USUARIO",


                accion:
                    "RECHAZO_ASIGNACION",


                id_estado_anterior:
                    asignacion.id_estado_ticket,


                id_estado_nuevo:
                    estadoTicket.id_estado,


                comentario:
                    observacion ||

                    "La asignación fue rechazada."

            });



        // =====================================
        // Registrar comunicación
        // =====================================

        await comunicacionesService.createCommunication({

            id_ticket:
                asignacion.id_ticket,

            tipo_emisor:
                "USUARIO",

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            mensaje:
                observacion ||

                "La asignación fue rechazada."
                
        });
            // =====================================
            // Registrar auditoría
            // =====================================

            await auditoriaService.registrarAuditoria({

                id_usuario:
                    id_usuario,


                id_ciudadano:
                    null,


                accion:
                    "RECHAZO_ASIGNACION",


                tabla_afectada:
                    "asignaciones",


                registro_afectado:
                    id_asignacion,


                valores_modificados: {

                    id_ticket:
                        asignacion.id_ticket,


                    id_oficina:
                        asignacion.id_oficina,


                    estado_asignacion_anterior:
                        asignacion.estado,


                    estado_asignacion_nuevo:
                        estado.nombre,


                    estado_ticket_anterior:
                        asignacion.estado_ticket,


                    estado_ticket_nuevo:
                        estadoTicket.nombre,


                    observacion:
                        observacion || null

                }

            });



            // =====================================
    // Notificar rechazo de asignación
    // =====================================

    await notificacionesService.createNotification({

        id_ticket:
            asignacion.id_ticket,

        id_incidencia:
            asignacion.id_incidencia,

        id_ciudadano:
            asignacion.id_ciudadano,

        id_tipo_notificacion:
            1,

        mensaje:
            `La asignación de tu ticket ${asignacion.codigo_ticket} fue rechazada.` +
            (
                observacion
                    ? ` Motivo: ${observacion}`
                    : ''
            )

    });

            // =====================================
            // Retornar resultado
            // =====================================

            return resultado;

        };





    // =====================================
    // Crear asignación automática desde ticket
    // SOLO PARA ATENCIÓN DIRECTA
    // =====================================

    // =====================================
    // CREAR ASIGNACIÓN AUTOMÁTICA
    // =====================================

    const createAutomaticAssignment = async (

        id_ticket,

        id_oficina,

        id_usuario

    ) => {

        // =====================================
        // VALIDAR DATOS
        // =====================================

        if (!id_ticket) {

            throw new Error(
                "El ticket es obligatorio"
            );

        }

        if (!id_oficina) {

            throw new Error(
                "La oficina responsable es obligatoria"
            );

        }

        if (!id_oficina) {

            throw new Error(
                "La oficina responsable es obligatoria"
            );

        }


        // =====================================
        // BUSCAR TICKET
        // =====================================

        const ticket =
            await repository.findTicketForAssignment(
                id_ticket
            );


        if (!ticket) {

            throw new Error(
                "El ticket no existe"
            );

        }


        // =====================================
        // VALIDAR MODALIDAD
        // =====================================

        if (
            ticket.modalidad_atencion !==
            "ATENCION_DIRECTA"
        ) {

            throw new Error(
                "La asignación automática solamente corresponde a tickets con modalidad ATENCION_DIRECTA"
            );

        }


        // =====================================
        // VALIDAR ESTADO DEL TICKET
        // =====================================

        if (
            ticket.estado_ticket !==
            "Pendiente de asignación"
        ) {

            throw new Error(
                "El ticket debe estar pendiente de asignación"
            );

        }


        // =====================================
        // VERIFICAR ASIGNACIÓN ACTIVA
        // =====================================

        const asignacionActiva =
            await repository.findActiveByTicket(
                id_ticket
            );


        if (asignacionActiva) {

            throw new Error(
                "El ticket ya tiene una asignación activa"
            );

        }


        // =====================================
        // BUSCAR ESTADO INICIAL
        // =====================================

        const estadoAsignacion =
            await repository.findStateByName(

                "ASIGNACION",

                "Pendiente de recepción"

            );


        if (!estadoAsignacion) {

            throw new Error(
                "No existe el estado inicial de asignación"
            );

        }


        // =====================================
        // CREAR ASIGNACIÓN
        // =====================================

        const asignacion =
            await repository.create({

                id_ticket,

                id_oficina,

                id_usuario: null,

                id_estado:
                    estadoAsignacion.id_estado

            });


        if (!asignacion) {

            throw new Error(
                "No se pudo crear la asignación automática"
            );

        }


        // =====================================
        // CAMBIAR ESTADO DEL TICKET
        // =====================================

        const estadoTicket =
            await repository.findStateByName(

                "TICKET",

                "Asignado"

            );


        if (!estadoTicket) {

            throw new Error(
                "No existe el estado Asignado"
            );

        }


        await repository.updateTicketStatus(

            id_ticket,

            estadoTicket.id_estado

        );


        // =====================================
        // SEGUIMIENTO
        // =====================================

        await seguimientoService.createTracking({

            id_ticket,

            id_usuario:
                id_usuario,

            id_ciudadano:
                null,

            origen:
                "SISTEMA",

            accion:
                "ASIGNACION_AUTOMATICA",

            id_estado_anterior:
                ticket.id_estado_ticket,

            id_estado_nuevo:
                estadoTicket.id_estado,

            comentario:
                "El ticket fue asignado automáticamente a la oficina responsable para atención directa."

        });


        // =====================================
        // COMUNICACIÓN
        // =====================================

        await comunicacionesService.createCommunication({

            id_ticket,

            tipo_emisor:
                "SISTEMA",

            id_usuario:
                null,

            id_ciudadano:
                ticket.id_ciudadano || null,

            mensaje:
                "El ticket fue asignado automáticamente a la oficina responsable y quedó pendiente de recepción."

        });


        // =====================================
        // AUDITORÍA
        // =====================================

        await auditoriaService.registrarAuditoria({

            id_usuario:
                id_usuario,

            id_ciudadano:
                ticket.id_ciudadano || null,

            accion:
                "ASIGNACION_AUTOMATICA",

            tabla_afectada:
                "asignaciones",

            registro_afectado:
                asignacion.id_asignacion,

            valores_modificados: {

                id_ticket,

                id_oficina,

                modalidad_atencion:
                    ticket.modalidad_atencion,

                estado_asignacion:
                    estadoAsignacion.nombre,

                estado_ticket_anterior:
                    ticket.estado_ticket,

                estado_ticket_nuevo:
                    estadoTicket.nombre

            }

        });


        return asignacion;

    };

    
        // =====================================
        // Obtener asignaciones pendientes por oficina
        // =====================================

        const getPendingAssignments = async(id_oficina)=>{


            const asignaciones =

                await repository.findPendingByOffice(

                    id_oficina

                );


            return asignaciones;


        };



    // =====================================
    // CREAR ASIGNACIÓN POR DERIVACIÓN
    // =====================================

    const createAssignmentFromDerivation = async (

        id_ticket,

        id_oficina,

        id_usuario

    ) => {

        // =====================================
        // VALIDAR DATOS
        // =====================================

        if (!id_ticket) {

            throw new Error(
                "El ticket es obligatorio"
            );

        }


        if (!id_oficina) {

            throw new Error(
                "La oficina destino es obligatoria"
            );

        }


        if (!id_usuario) {

            throw new Error(
                "El usuario es obligatorio"
            );

        }


        // =====================================
        // BUSCAR TICKET
        // =====================================

        const ticket =
            await repository.findTicketForAssignment(
                id_ticket
            );


        if (!ticket) {

            throw new Error(
                "El ticket no existe"
            );

        }


        // =====================================
        // VERIFICAR ASIGNACIÓN ACTIVA
        // =====================================

        const asignacionActiva =
            await repository.findActiveByTicket(
                id_ticket
            );


        if (asignacionActiva) {

            throw new Error(
                "El ticket ya tiene una asignación activa. Debe finalizarse la asignación anterior antes de crear una nueva."
            );

        }


        // =====================================
        // BUSCAR ESTADO INICIAL
        // =====================================

        const estadoAsignacion =
            await repository.findStateByName(

                "ASIGNACION",

                "Pendiente de recepción"

            );


        if (!estadoAsignacion) {

            throw new Error(
                "No existe el estado inicial de asignación"
            );

        }


        // =====================================
        // CREAR NUEVA ASIGNACIÓN
        // =====================================

        const asignacion =
            await repository.create({

                id_ticket,

                id_oficina,

                // Todavía no existe responsable receptor
                id_usuario:
                    null,

                id_estado:
                    estadoAsignacion.id_estado

            });


        if (!asignacion) {

            throw new Error(
                "No se pudo crear la asignación por derivación"
            );

        }


        // =====================================
        // BUSCAR ESTADO ASIGNADO
        // =====================================

        const estadoTicket =
            await repository.findStateByName(

                "TICKET",

                "Asignado"

            );


        if (!estadoTicket) {

            throw new Error(
                "No existe el estado Asignado"
            );

        }


        // =====================================
        // ACTUALIZAR ESTADO DEL TICKET
        // =====================================

        await repository.updateTicketStatus(

            id_ticket,

            estadoTicket.id_estado

        );


        // =====================================
        // SEGUIMIENTO
        // =====================================

        await seguimientoService.createTracking({

            id_ticket,

            // Usuario que ejecutó la derivación
            id_usuario,

            id_ciudadano:
                null,

            origen:
                "SISTEMA",

            accion:
                "NUEVA_ASIGNACION_DERIVACION",

            id_estado_anterior:
                ticket.id_estado_ticket,

            id_estado_nuevo:
                estadoTicket.id_estado,

            comentario:
                "Se creó una nueva asignación para la oficina destino como resultado de la derivación del ticket."

        });


        // =====================================
        // COMUNICACIÓN
        // =====================================

        await comunicacionesService.createCommunication({

            id_ticket,

            tipo_emisor:
                "SISTEMA",

            id_usuario:
                null,

            id_ciudadano:
                ticket.id_ciudadano || null,

            mensaje:
                "Se creó una nueva asignación para la oficina destino debido a la derivación del ticket."

        });


        // =====================================
        // AUDITORÍA
        // =====================================

        await auditoriaService.registrarAuditoria({

            // Usuario que ejecutó la derivación
            id_usuario,

            id_ciudadano:
                ticket.id_ciudadano || null,

            accion:
                "NUEVA_ASIGNACION_DERIVACION",

            tabla_afectada:
                "asignaciones",

            registro_afectado:
                asignacion.id_asignacion,

            valores_modificados: {

                id_ticket,

                id_oficina,

                estado_asignacion:
                    estadoAsignacion.nombre,

                estado_ticket_anterior:
                    ticket.estado_ticket,

                estado_ticket_nuevo:
                    estadoTicket.nombre,

                tipo_asignacion:
                    "DERIVACION"

            }

        });


        return asignacion;

    };
    // =====================================
    // Iniciar asignación desde atención
    // =====================================

    const startAssignmentFromAttention = async (

        id_asignacion,

        id_usuario

    ) => {

        // =====================================
        // Buscar asignación
        // =====================================

        const asignacion =
            await repository.findById(
                id_asignacion
            );


        if (!asignacion) {

            throw new Error(
                "La asignación no existe"
            );

        }


        // =====================================
        // Validar estado actual
        // =====================================

        if (
            asignacion.estado !==
            "Recibida"
        ) {

            throw new Error(
                "Solo se puede iniciar una asignación que haya sido recibida"
            );

        }

    // =====================================
    // Validar usuario receptor
    // =====================================

    if (
        asignacion.usuario_receptor &&
        Number(asignacion.usuario_receptor) !==
        Number(id_usuario)
    ) {

        throw new Error(
            "Solo el usuario que recibió la asignación puede iniciar la atención"
        );

    }
        // =====================================
        // Buscar estado En proceso
        // =====================================

        const estadoNuevo =
            await repository.findStateByName(

                "ASIGNACION",

                "En proceso"

            );


        if (!estadoNuevo) {

            throw new Error(
                "No existe estado En proceso"
            );

        }


        // =====================================
        // Actualizar asignación
        // =====================================

        const resultado =
            await repository.startProcess(

                id_asignacion,

                estadoNuevo.id_estado

            );


        if (!resultado) {

            throw new Error(
                "No se pudo iniciar la asignación"
            );

        }


        // =====================================
        // Buscar estado En Atención
        // =====================================

        const estadoTicket =
            await repository.findStateByName(

                "TICKET",

                "En Atención"

            );


        if (!estadoTicket) {

            throw new Error(
                "No existe estado En Atención para el ticket"
            );

        }


        // =====================================
        // Actualizar estado del ticket
        // =====================================

        const ticketActualizado =
            await repository.updateTicketStatus(

                asignacion.id_ticket,

                estadoTicket.id_estado

            );


        if (!ticketActualizado) {

            throw new Error(
                "No se pudo actualizar el estado del ticket"
            );

        }


        // =====================================
        // Registrar seguimiento
        // =====================================

        await seguimientoService.createTracking({

            id_ticket:
                asignacion.id_ticket,

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            origen:
                "USUARIO",

            accion:
                "INICIO_ATENCION",

            id_estado_anterior:
                asignacion.id_estado_ticket,

            id_estado_nuevo:
                estadoTicket.id_estado,

            comentario:
                "La asignación fue iniciada y el ticket pasó a estado En Atención."

        });


        // =====================================
        // Registrar comunicación
        // =====================================

        await comunicacionesService.createCommunication({

            id_ticket:
                asignacion.id_ticket,

            tipo_emisor:
                "USUARIO",

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            mensaje:
                "La atención de la incidencia fue iniciada."

        });


        // =====================================
        // Registrar auditoría
        // =====================================

        await auditoriaService.registrarAuditoria({

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            accion:
                "INICIO_ATENCION",

            tabla_afectada:
                "asignaciones",

            registro_afectado:
                id_asignacion,

            valores_modificados: {

                estado_asignacion_anterior:
                    asignacion.estado,

                estado_asignacion_nuevo:
                    estadoNuevo.nombre,

                estado_ticket_anterior:
                    asignacion.estado_ticket,

                estado_ticket_nuevo:
                    estadoTicket.nombre

            }

        });


        // =====================================
        // Resultado
        // =====================================

        return {

            asignacion:
                resultado,

            ticket:
                ticketActualizado

        };

    };



    // =====================================
    // Finalizar asignación desde atención
    // =====================================

    const finishAssignmentFromAttention = async (

        id_asignacion,

        observacion,

        id_usuario

    ) => {

        // =====================================
        // Buscar asignación
        // =====================================

        const asignacion =
            await repository.findById(
                id_asignacion
            );


        if (!asignacion) {

            throw new Error(
                "La asignación no existe"
            );

        }


        // =====================================
        // Validar estado actual
        // =====================================

        if (
            asignacion.estado !==
            "En proceso"
        ) {

            throw new Error(
                "Solo se puede finalizar una asignación que se encuentre en proceso"
            );

        }


        // =====================================
        // Buscar estado Finalizada
        // =====================================

        const estadoNuevo =
            await repository.findStateByName(

                "ASIGNACION",

                "Finalizada"

            );


        if (!estadoNuevo) {

            throw new Error(
                "No existe estado Finalizada"
            );

        }


        // =====================================
        // Finalizar asignación
        // =====================================

        const resultado =
            await repository.finishAssignment(

                id_asignacion,

                estadoNuevo.id_estado,

                observacion

            );


        if (!resultado) {

            throw new Error(
                "No se pudo finalizar la asignación"
            );

        }


        // =====================================
        // Buscar estado Resuelto del ticket
        // =====================================

        const estadoTicket =
            await repository.findStateByName(

                "TICKET",

                "Resuelto"

            );


        if (!estadoTicket) {

            throw new Error(
                "No existe estado Resuelto para el ticket"
            );

        }


        // =====================================
        // Actualizar estado del ticket
        // =====================================

        const ticketActualizado =
            await repository.updateTicketStatus(

                asignacion.id_ticket,

                estadoTicket.id_estado

            );


        if (!ticketActualizado) {

            throw new Error(
                "No se pudo actualizar el estado del ticket"
            );

        }


        // =====================================
        // Registrar seguimiento
        // =====================================

        await seguimientoService.createTracking({

            id_ticket:
                asignacion.id_ticket,

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            origen:
                "USUARIO",

            accion:
                "FINALIZACION_ATENCION",

            id_estado_anterior:
                asignacion.id_estado_ticket,

            id_estado_nuevo:
                estadoTicket.id_estado,

            comentario:
                observacion ||
                "La atención de la incidencia fue finalizada correctamente."

        });


        // =====================================
        // Registrar comunicación
        // =====================================

        await comunicacionesService.createCommunication({

            id_ticket:
                asignacion.id_ticket,

            tipo_emisor:
                "USUARIO",

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            mensaje:
                observacion ||
                "La atención de la incidencia fue finalizada y el ticket quedó resuelto."

        });


        // =====================================
        // Registrar auditoría
        // =====================================

        await auditoriaService.registrarAuditoria({

            id_usuario:
                id_usuario,

            id_ciudadano:
                asignacion.id_ciudadano || null,

            accion:
                "FINALIZACION_ATENCION",

            tabla_afectada:
                "asignaciones",

            registro_afectado:
                id_asignacion,

            valores_modificados: {

                estado_asignacion_anterior:
                    asignacion.estado,

                estado_asignacion_nuevo:
                    estadoNuevo.nombre,

                estado_ticket_anterior:
                    asignacion.estado_ticket,

                estado_ticket_nuevo:
                    estadoTicket.nombre,

                observacion:
                    observacion || null

            }

        });


        // =====================================
        // Resultado
        // =====================================

        return {

            asignacion:
                resultado,

            ticket:
                ticketActualizado

        };

    };



    module.exports={

        createAssignment,

        createAutomaticAssignment,

        createAssignmentFromDerivation,

        findById,

        findByOffice,

        getPendingAssignments,

        receiveAssignment,

        rejectAssignment,

        startAssignmentFromAttention,

        finishAssignmentFromAttention

    };