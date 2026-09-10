const repository =
    require('./auditoria.repository');



// =====================================
// REGISTRAR AUDITORÍA
// =====================================

const registrarAuditoria = async (data) => {

    // =====================================
    // VALIDAR DATOS
    // =====================================

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de auditoría son obligatorios'
        );

    }


    // =====================================
    // VALIDAR ACCIÓN
    // =====================================

    if (
        !data.accion ||
        typeof data.accion !== 'string' ||
        !data.accion.trim()
    ) {

        throw new Error(
            'La acción de auditoría es obligatoria'
        );

    }


    // =====================================
    // VALIDAR TABLA AFECTADA
    // =====================================

    if (
        !data.tabla_afectada ||
        typeof data.tabla_afectada !== 'string' ||
        !data.tabla_afectada.trim()
    ) {

        throw new Error(
            'La tabla afectada es obligatoria'
        );

    }


    // =====================================
    // VALIDAR REGISTRO AFECTADO
    // =====================================

    if (
        data.registro_afectado === undefined ||
        data.registro_afectado === null ||
        data.registro_afectado === ''
    ) {

        throw new Error(
            'El registro afectado es obligatorio'
        );

    }


    const registroAfectado =
        Number(data.registro_afectado);


    if (
        !Number.isInteger(registroAfectado) ||
        registroAfectado <= 0
    ) {

        throw new Error(
            'El registro afectado debe ser un entero positivo'
        );

    }


    // =====================================
    // NORMALIZAR VALORES
    // =====================================

    const accion =
        data.accion.trim();

    const tablaAfectada =
        data.tabla_afectada.trim();


    // =====================================
    // REGISTRAR AUDITORÍA
    // =====================================

    const auditoria =
        await repository.create({

            id_usuario:
                data.id_usuario || null,

            id_ciudadano:
                data.id_ciudadano || null,

            accion,

            tabla_afectada:
                tablaAfectada,

            registro_afectado:
                registroAfectado,

            valores_modificados:
                data.valores_modificados || null

        });


    return auditoria;

};



// =====================================
// BUSCAR AUDITORÍA POR ID
// =====================================

const findById = async (
    id_auditoria
) => {

    if (!id_auditoria) {

        throw new Error(
            'El ID de auditoría es obligatorio'
        );

    }


    const id =
        Number(id_auditoria);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            'El ID de auditoría debe ser un entero positivo'
        );

    }


    const auditoria =
        await repository.findById(
            id
        );


    if (!auditoria) {

        throw new Error(
            'El registro de auditoría no existe'
        );

    }


    return auditoria;

};



// =====================================
// BUSCAR AUDITORÍA DE UN REGISTRO
// =====================================

const findByRecord = async (
    tabla_afectada,
    registro_afectado
) => {

    // =====================================
    // VALIDAR TABLA
    // =====================================

    if (
        !tabla_afectada ||
        typeof tabla_afectada !== 'string' ||
        !tabla_afectada.trim()
    ) {

        throw new Error(
            'La tabla afectada es obligatoria'
        );

    }


    // =====================================
    // VALIDAR REGISTRO
    // =====================================

    if (
        registro_afectado === undefined ||
        registro_afectado === null ||
        registro_afectado === ''
    ) {

        throw new Error(
            'El registro afectado es obligatorio'
        );

    }


    const registro =
        Number(registro_afectado);


    if (
        !Number.isInteger(registro) ||
        registro <= 0
    ) {

        throw new Error(
            'El registro afectado debe ser un entero positivo'
        );

    }


    // =====================================
    // CONSULTAR HISTORIAL
    // =====================================

    return await repository.findByRecord(

        tabla_afectada.trim(),

        registro

    );

};



// =====================================
// LISTAR TODAS LAS AUDITORÍAS
// =====================================

const findAll = async () => {

    return await repository.findAll();

};



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    registrarAuditoria,

    findById,

    findByRecord,

    findAll

};