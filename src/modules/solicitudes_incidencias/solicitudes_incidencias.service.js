const repository =
    require('./solicitudes_incidencias.repository');

const archivosService =
    require('../archivos/archivos.service');

const notificacionesService =
    require('../notificaciones/notificaciones.service');

const asignacionesService =
    require('../asignaciones/asignaciones.service');
// =====================================
// CONFIGURACIÓN
// =====================================

const ESTADOS_SAIU = {

    PENDIENTE_EXPEDIENTE:
        'PENDIENTE_EXPEDIENTE',

    EXPEDIENTE_REGISTRADO:
        'EXPEDIENTE_REGISTRADO',

    VINCULADO:
        'VINCULADO'

};


const ESTADO_TICKET_VALIDADO =
    'Validada';


// =====================================
// GENERAR CÓDIGO SAIU
// =====================================

const generateCodigoSAIU = (
    id_ticket
) => {

    const timestamp =
        Date.now();

    return `SAIU-${id_ticket}-${timestamp}`;

};


// =====================================
// CREAR SAIU
// =====================================

const createSAIU = async (
    data
) => {

    const {

        id_ticket,

        id_usuario,

        id_oficina = null,

        observacion = null

    } = data;


    // =====================================
    // VALIDAR DATOS BÁSICOS
    // =====================================

    if (!id_ticket) {

        throw new Error(
            'El ticket es obligatorio'
        );

    }


    if (!id_usuario) {

        throw new Error(
            'El usuario es obligatorio'
        );

    }


    // =====================================
    // BUSCAR TICKET
    // =====================================

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
    // VALIDAR ESTADO DEL TICKET
    // =====================================

    if (
        ticket.estado_ticket !==
        'Pendiente de asignación'
    ) {

        throw new Error(
            'Solo se puede generar un SAIU cuando el ticket está pendiente de asignación'
        );

    }


    // =====================================
    // VALIDAR MODALIDAD
    // =====================================

    if (
        ticket.modalidad_atencion !==
        'SOLICITUD_ADMINISTRATIVA'
    ) {

        throw new Error(
            'El ticket no está configurado para atención mediante solicitud administrativa'
        );

    }


    // =====================================
    // VERIFICAR SAIU EXISTENTE
    // =====================================

    const existe =
        await repository.existsByTicket(
            id_ticket
        );


    if (existe) {

        throw new Error(
            'El ticket ya tiene una solicitud SAIU'
        );

    }


    // =====================================
    // BUSCAR ESTADO INICIAL
    // =====================================

    const estado =
        await repository.findStateByName(
            ESTADOS_SAIU.PENDIENTE_EXPEDIENTE
        );


    if (!estado) {

        throw new Error(
            'No existe el estado PENDIENTE_EXPEDIENTE'
        );

    }


    // =====================================
    // GENERAR CÓDIGO SAIU
    // =====================================

    const codigoSAIU =
        generateCodigoSAIU(
            id_ticket
        );


    // =====================================
    // CREAR SAIU
    // =====================================

    const saiu =
        await repository.create({

            id_ticket,

            codigo_saiu:
                codigoSAIU,

            id_usuario,

            id_oficina,

            id_estado_saiu:
                estado.id_estado_saiu,

            observacion

        });


    if (!saiu) {

        throw new Error(
            'No se pudo generar el SAIU'
        );

    }


    // =====================================
    // BUSCAR RESPONSABLES DE LA OFICINA
    // =====================================

    const responsables =
        await notificacionesService
            .findResponsibleUsersByOffice(
                saiu.id_oficina
            );


    // =====================================
    // MENSAJE DE NOTIFICACIÓN
    // =====================================

    const mensaje =
        `Existe un trámite administrativo pendiente ` +
        `en Mesa de Partes destinado a su oficina.\n\n` +
        `Código SAIU: ${saiu.codigo_saiu}\n` +
        `Ticket: ${saiu.id_ticket}\n` +
        `Estado: Pendiente de expediente.\n\n` +
        `El trámite será recibido por la oficina una vez ` +
        `que Mesa de Partes lo derive mediante el expediente correspondiente.`;


    // =====================================
    // NOTIFICAR RESPONSABLES
    // =====================================

    for (
        const responsable of responsables
    ) {

        await notificacionesService
            .createNotification({

                id_ticket:
                    saiu.id_ticket,

                id_incidencia:
                    null,

                id_usuario:
                    responsable.id_usuario,

                id_ciudadano:
                    null,

                mensaje

            });

    }


    // =====================================
    // RESULTADO
    // =====================================

    return saiu;

};



// =====================================
// OBTENER SAIU POR ID
// =====================================

const findById = async (
    id_saiu
) => {

    if (!id_saiu) {

        throw new Error(
            'El ID del SAIU es obligatorio'
        );

    }


    const saiu =
        await repository.findById(
            id_saiu
        );


    if (!saiu) {

        throw new Error(
            'El SAIU no existe'
        );

    }


    return saiu;

};


// =====================================
// OBTENER SAIU POR TICKET
// =====================================

const findByTicket = async (
    id_ticket
) => {

    if (!id_ticket) {

        throw new Error(
            'El ID del ticket es obligatorio'
        );

    }


    const saiu =
        await repository.findByTicket(
            id_ticket
        );


    if (!saiu) {

        throw new Error(
            'El ticket no tiene un SAIU asociado'
        );

    }


    return saiu;

};



// =====================================
// OBTENER SOLICITUD ADMINISTRATIVA POR CÓDIGO SAIU
// =====================================

const findByCodigo = async (
    codigo_saiu
) => {

    // =====================================
    // VALIDAR CÓDIGO
    // =====================================

    if (!codigo_saiu) {

        throw new Error(
            'El código SAIU es obligatorio'
        );

    }


    // =====================================
    // BUSCAR SAIU
    // =====================================

    const saiu =
        await repository.findByCodigo(
            codigo_saiu
        );


    if (!saiu) {

        throw new Error(
            'No existe un SAIU con el código proporcionado'
        );

    }


    // =====================================
    // OBTENER SOLICITUD COMPLETA
    // =====================================

    const solicitud =
        await getAdministrativeRequest(
            saiu.id_saiu
        );


    // =====================================
    // RESULTADO
    // =====================================

    return solicitud;

};






// =====================================
// REGISTRAR EXPEDIENTE
// =====================================

const registerExpediente = async (
    data
) => {

    const {

        codigo_saiu,

        numero_expediente,

        fecha_expediente =
            new Date(),

        id_usuario

    } = data;


    // =====================================
    // VALIDAR DATOS
    // =====================================

    if (!codigo_saiu) {

        throw new Error(
            'El código SAIU es obligatorio'
        );

    }


    if (!numero_expediente) {

        throw new Error(
            'El número de expediente es obligatorio'
        );

    }


    if (!id_usuario) {

        throw new Error(
            'El usuario es obligatorio'
        );

    }


    // =====================================
    // BUSCAR SAIU POR CÓDIGO
    // =====================================

    const saiu =
        await repository.findByCodigo(
            codigo_saiu
        );


    if (!saiu) {

        throw new Error(
            'No existe un SAIU con el código proporcionado'
        );

    }


    // =====================================
    // BUSCAR USUARIO AUTENTICADO
    // =====================================

    const usuario =
        await repository.findUserById(
            id_usuario
        );


    if (!usuario) {

        throw new Error(
            'El usuario no existe'
        );

    }


    // =====================================
    // VALIDAR USUARIO ACTIVO
    // =====================================

    if (
        usuario.estado !== true
    ) {

        throw new Error(
            'El usuario no está activo'
        );

    }


    // =====================================
    // VALIDAR OFICINA DEL USUARIO
    // =====================================

    if (
        !usuario.id_oficina
    ) {

        throw new Error(
            'El usuario no tiene una oficina asignada'
        );

    }


    // =====================================
    // VALIDAR OFICINA RESPONSABLE
    // =====================================

    if (
        Number(usuario.id_oficina) !==
        Number(saiu.id_oficina)
    ) {

        throw new Error(
            'El usuario no pertenece a la oficina responsable del trámite'
        );

    }


    // =====================================
    // VALIDAR ESTADO DEL SAIU
    // =====================================

    if (
        saiu.estado_saiu !==
        ESTADOS_SAIU.PENDIENTE_EXPEDIENTE
    ) {

        throw new Error(
            'El expediente solamente puede registrarse cuando el SAIU está pendiente de expediente'
        );

    }


    // =====================================
    // VERIFICAR QUE EL SAIU
    // TODAVÍA NO TENGA EXPEDIENTE
    // =====================================

    if (
        saiu.numero_expediente
    ) {

        throw new Error(
            `El SAIU ya tiene un número de expediente registrado: ${saiu.numero_expediente}`
        );

    }


    // =====================================
    // VERIFICAR EXPEDIENTE EXISTENTE
    // =====================================

    const expedienteExistente =
        await repository.findByExpediente(
            numero_expediente
        );


    if (
        expedienteExistente
    ) {

        throw new Error(
            'El número de expediente ya está asociado a un SAIU'
        );

    }


    // =====================================
    // BUSCAR NUEVO ESTADO
    // =====================================

    const estado =
        await repository.findStateByName(
            ESTADOS_SAIU.EXPEDIENTE_REGISTRADO
        );


    if (!estado) {

        throw new Error(
            'No existe el estado EXPEDIENTE_REGISTRADO'
        );

    }


    // =====================================
    // REGISTRAR EXPEDIENTE
    // =====================================

    const actualizado =
        await repository.registerExpediente(

            saiu.id_saiu,

            numero_expediente,

            fecha_expediente,

            estado.id_estado_saiu

        );


    if (!actualizado) {

        throw new Error(
            'No se pudo registrar el expediente'
        );

    }


    // =====================================
    // RESULTADO
    // =====================================

    return actualizado;

};





// =====================================
// LISTAR SAIU
// =====================================

const findAll = async () => {

    return await repository.findAll();

};


// =====================================
// OBTENER SOLICITUD ADMINISTRATIVA COMPLETA
// =====================================


const getAdministrativeRequest = async (id_saiu) => {

    // =====================================
    // VALIDAR ID
    // =====================================

    if (!id_saiu || !Number.isInteger(Number(id_saiu)) || Number(id_saiu) <= 0) {
        throw new Error(
            'El ID del SAIU es obligatorio y debe ser válido'
        );
    }

    // =====================================
    // BUSCAR SOLICITUD COMPLETA
    // =====================================

    const solicitud =
        await repository.findAdministrativeRequestBySAIU(
            Number(id_saiu)
        );

    if (!solicitud) {
        throw new Error(
            'No existe una solicitud administrativa asociada al SAIU'
        );
    }

    // =====================================
    // VALIDAR MODALIDAD
    // =====================================

    if (
        solicitud.modalidad_atencion !==
        'SOLICITUD_ADMINISTRATIVA'
    ) {
        throw new Error(
            'El ticket no corresponde a una solicitud administrativa'
        );
    }

    // =====================================
    // OBTENER EVIDENCIAS
    // =====================================

    const evidencias =
        await archivosService.findByIncident(
            solicitud.id_incidencia,
            solicitud.id_ciudadano
        );

    // =====================================
    // ORGANIZAR RESPUESTA
    // =====================================

    return {
        saiu: {
            id_saiu: solicitud.id_saiu,
            codigo_saiu: solicitud.codigo_saiu,
            id_ticket: solicitud.id_ticket,
            id_usuario: solicitud.id_usuario_saiu,
            id_oficina: solicitud.id_oficina,
            estado: solicitud.estado_saiu,
            fecha_generacion: solicitud.fecha_generacion,
            numero_expediente: solicitud.numero_expediente,
            fecha_expediente: solicitud.fecha_expediente
        },

        ticket: {
            id_ticket: solicitud.id_ticket,
            codigo_ticket: solicitud.codigo_ticket,
            modalidad_atencion: solicitud.modalidad_atencion,
            id_prioridad: solicitud.id_prioridad,
            fecha_creacion: solicitud.fecha_creacion,
            fecha_limite: solicitud.fecha_limite
        },

        ciudadano: {
            id_ciudadano: solicitud.id_ciudadano,
            nombres: solicitud.nombres,
            apellido_paterno: solicitud.apellido_paterno,
            apellido_materno: solicitud.apellido_materno,
            dni: solicitud.dni,
            telefono: solicitud.telefono,
            correo: solicitud.correo
        },

        incidencia: {
            id_incidencia: solicitud.id_incidencia,
            titulo: solicitud.titulo,
            descripcion: solicitud.descripcion,
            ubicacion: solicitud.ubicacion,

            // Datos adicionales para el PDF
            categoria: solicitud.categoria,
            direccion_texto: solicitud.direccion_texto,
            referencia: solicitud.referencia,
            latitud: solicitud.latitud,
            longitud: solicitud.longitud
        },

        oficina_responsable: {
            id_oficina: solicitud.id_oficina,
            nombre: solicitud.oficina_nombre
        },

        evidencias
    };
};




// =====================================
// CONFIRMAR RECEPCIÓN DEL SAIU
// =====================================

const receiveSAIU = async (
    data
) => {

    const {

        codigo_saiu,

        id_usuario,

        fecha_vinculacion =
            new Date()

    } = data;


    // =====================================
    // VALIDAR DATOS
    // =====================================

    if (!codigo_saiu) {

        throw new Error(
            'El código SAIU es obligatorio'
        );

    }


    if (!id_usuario) {

        throw new Error(
            'El usuario es obligatorio'
        );

    }


    // =====================================
    // BUSCAR SAIU
    // =====================================

    const saiu =
        await repository.findByCodigo(
            codigo_saiu
        );


    if (!saiu) {

        throw new Error(
            'No existe un SAIU con el código proporcionado'
        );

    }


    // =====================================
    // BUSCAR USUARIO
    // =====================================

    const usuario =
        await repository.findUserById(
            id_usuario
        );


    if (!usuario) {

        throw new Error(
            'El usuario no existe'
        );

    }


    // =====================================
    // VALIDAR USUARIO ACTIVO
    // =====================================

    if (
        usuario.estado !== true
    ) {

        throw new Error(
            'El usuario no está activo'
        );

    }


    // =====================================
    // VALIDAR OFICINA DEL USUARIO
    // =====================================

    if (
        !usuario.id_oficina
    ) {

        throw new Error(
            'El usuario no tiene una oficina asignada'
        );

    }


    // =====================================
    // VALIDAR OFICINA RESPONSABLE
    // =====================================

    if (
        Number(usuario.id_oficina) !==
        Number(saiu.id_oficina)
    ) {

        throw new Error(
            'El usuario no pertenece a la oficina responsable del trámite'
        );

    }


    // =====================================
    // VALIDAR ESTADO ACTUAL DEL SAIU
    // =====================================

    if (
        saiu.estado_saiu !==
        ESTADOS_SAIU.EXPEDIENTE_REGISTRADO
    ) {

        throw new Error(
            'El SAIU debe tener el estado EXPEDIENTE_REGISTRADO para confirmar su recepción'
        );

    }


    // =====================================
    // VALIDAR EXPEDIENTE
    // =====================================

    if (
        !saiu.numero_expediente
    ) {

        throw new Error(
            'El SAIU no tiene un número de expediente registrado'
        );

    }


    // =====================================
    // BUSCAR ESTADO VINCULADO
    // =====================================

    const estado =
        await repository.findStateByName(
            ESTADOS_SAIU.VINCULADO
        );


    if (!estado) {

        throw new Error(
            'No existe el estado VINCULADO'
        );

    }


    // =====================================
    // CONFIRMAR RECEPCIÓN DEL SAIU
    // =====================================

    const recibido =
        await repository.receiveSAIU(

            saiu.id_saiu,

            estado.id_estado_saiu,

            fecha_vinculacion

        );


    if (!recibido) {

        throw new Error(
            'No se pudo confirmar la recepción del trámite'
        );

    }


    // =====================================
    // CREAR ASIGNACIÓN
    // =====================================

    const asignacion =
        await asignacionesService.createAssignment({

            id_ticket:
                saiu.id_ticket,

            id_oficina:
                saiu.id_oficina,

            id_usuario:
                null

        });


    if (!asignacion) {

        throw new Error(
            'No se pudo crear la asignación del trámite'
        );

    }


    // =====================================
    // RECIBIR ASIGNACIÓN
    // =====================================

    const asignacionRecibida =
        await asignacionesService.receiveAssignment(

            asignacion.id_asignacion,

            id_usuario,

            id_usuario

        );


    if (!asignacionRecibida) {

        throw new Error(
            'No se pudo recibir la asignación del trámite'
        );

    }


    // =====================================
    // RESULTADO
    // =====================================

    return {

        saiu:
            recibido,

        asignacion:
            asignacionRecibida

    };

};



// =====================================
// CORREGIR NÚMERO DE EXPEDIENTE
// =====================================

const updateExpediente = async (
    data
) => {

    const {

        codigo_saiu,

        numero_expediente,

        id_usuario

    } = data;


    // =====================================
    // VALIDAR DATOS
    // =====================================

    if (!codigo_saiu) {

        throw new Error(
            'El código SAIU es obligatorio'
        );

    }


    if (!numero_expediente) {

        throw new Error(
            'El número de expediente es obligatorio'
        );

    }


    if (!id_usuario) {

        throw new Error(
            'El usuario es obligatorio'
        );

    }


    // =====================================
    // BUSCAR SAIU POR CÓDIGO
    // =====================================

    const saiu =
        await repository.findByCodigo(
            codigo_saiu
        );


    if (!saiu) {

        throw new Error(
            'No existe un SAIU con el código proporcionado'
        );

    }


    // =====================================
    // VERIFICAR QUE EXISTA EXPEDIENTE
    // =====================================

    if (
        !saiu.numero_expediente
    ) {

        throw new Error(
            'No existe un número de expediente registrado para este SAIU'
        );

    }


    // =====================================
    // BUSCAR USUARIO
    // =====================================

    const usuario =
        await repository.findUserById(
            id_usuario
        );


    if (!usuario) {

        throw new Error(
            'El usuario no existe'
        );

    }


    // =====================================
    // VALIDAR USUARIO ACTIVO
    // =====================================

    if (
        usuario.estado !== true
    ) {

        throw new Error(
            'El usuario no está activo'
        );

    }


    // =====================================
    // VALIDAR OFICINA DEL USUARIO
    // =====================================

    if (
        !usuario.id_oficina
    ) {

        throw new Error(
            'El usuario no tiene una oficina asignada'
        );

    }


    // =====================================
    // VALIDAR OFICINA RESPONSABLE
    // =====================================

    if (
        Number(usuario.id_oficina) !==
        Number(saiu.id_oficina)
    ) {

        throw new Error(
            'El usuario no pertenece a la oficina responsable del trámite'
        );

    }


    // =====================================
    // VALIDAR QUE SEA DIFERENTE
    // =====================================

    if (
        saiu.numero_expediente ===
        numero_expediente
    ) {

        throw new Error(
            'El nuevo número de expediente debe ser diferente al actual'
        );

    }


    // =====================================
    // VERIFICAR EXPEDIENTE EXISTENTE
    // =====================================

    const expedienteExistente =
        await repository.findByExpediente(
            numero_expediente
        );


    if (
        expedienteExistente &&
        Number(
            expedienteExistente.id_saiu
        ) !==
        Number(
            saiu.id_saiu
        )
    ) {

        throw new Error(
            'El número de expediente ya está asociado a otro SAIU'
        );

    }


    // =====================================
    // GUARDAR VALOR ANTERIOR
    // =====================================

    const expedienteAnterior =
        saiu.numero_expediente;


    // =====================================
    // ACTUALIZAR EXPEDIENTE
    // =====================================

    const actualizado =
        await repository.updateExpediente(

            saiu.id_saiu,

            numero_expediente

        );


    if (!actualizado) {

        throw new Error(
            'No se pudo actualizar el número de expediente'
        );

    }


    // =====================================
    // RESULTADO
    // =====================================

    return {

        anterior:
            expedienteAnterior,

        actual:
            actualizado.numero_expediente,

        saiu:
            actualizado

    };

};




// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createSAIU,

    findById,

    findByTicket,

    findByCodigo,

    registerExpediente,

    findAll,

    getAdministrativeRequest,

    receiveSAIU,

    updateExpediente

};