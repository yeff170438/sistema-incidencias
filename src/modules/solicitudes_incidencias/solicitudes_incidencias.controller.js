const service =
    require('./solicitudes_incidencias.service');


const validator =
    require('./solicitudes_incidencias.validator');


// =====================================
// SOLICITUDES DE INCIDENCIA CONTROLLER
// =====================================


// =====================================
// CREAR SAIU
// =====================================

const createSAIU = async (
    req,
    res
) => {

    try {

        const datosValidados =
            validator.validateCreate(
                req.body
            );


        const data = {

            ...datosValidados,

            id_usuario:
                req.user.id_usuario

        };


        const saiu =
            await service.createSAIU(
                data
            );


        return res.status(201).json({

            mensaje:
                'SAIU generado correctamente',

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error creando SAIU:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// OBTENER SAIU POR ID
// =====================================

const findById = async (
    req,
    res
) => {

    try {

        const id_saiu =
            validator.validateId(

                req.params.id_saiu,

                'id_saiu'

            );


        const saiu =
            await service.findById(
                id_saiu
            );


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error obteniendo SAIU:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// OBTENER SAIU POR TICKET
// =====================================

const findByTicket = async (
    req,
    res
) => {

    try {

        const id_ticket =
            validator.validateId(

                req.params.id_ticket,

                'id_ticket'

            );


        const saiu =
            await service.findByTicket(
                id_ticket
            );


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error obteniendo SAIU por ticket:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// OBTENER SAIU POR CÓDIGO
// =====================================

const findByCodigo = async (
    req,
    res
) => {

    try {

        const codigo =
            validator.validateCodigoConsulta(

                req.params.codigo_saiu

            );


        const saiu =
            await service.findByCodigo(
                codigo
            );


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error obteniendo SAIU por código:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// REGISTRAR EXPEDIENTE
// =====================================

const registerExpediente = async (
    req,
    res
) => {

    try {

        // =====================================
        // VALIDAR DATOS RECIBIDOS
        // =====================================

        const data =
            validator.validateRegisterExpediente({

                ...req.body

            });


        // =====================================
        // USUARIO AUTENTICADO
        // =====================================

        data.id_usuario =
            req.user.id_usuario;


        // =====================================
        // REGISTRAR EXPEDIENTE
        // =====================================

        const saiu =
            await service.registerExpediente(
                data
            );


        return res.status(200).json({

            mensaje:
                'Número de expediente registrado correctamente',

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error registrando expediente:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};





// =====================================
// LISTAR SAIU
// =====================================

const findAll = async (
    req,
    res
) => {

    try {

        const saiu =
            await service.findAll();


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error listando SAIU:',
            error
        );


        return res.status(500).json({

            mensaje:
                'Error interno del servidor'

        });

    }

};

// =====================================
// OBTENER SOLICITUD ADMINISTRATIVA COMPLETA
// =====================================

const getAdministrativeRequest = async (
    req,
    res
) => {

    try {

        const id_saiu =
            validator.validateId(
                req.params.id_saiu,
                'id_saiu'
            );


        const solicitud =
            await service.getAdministrativeRequest(
                id_saiu
            );


        return res.status(200).json({

            mensaje:
                'Solicitud administrativa obtenida correctamente',

            data:
                solicitud

        });

    } catch (error) {

        console.error(
            'Error obteniendo solicitud administrativa:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// CONFIRMAR RECEPCIÓN DEL SAIU
// =====================================

const receiveSAIU = async (
    req,
    res
) => {

    try {

        const data = {

            ...req.body,

            id_usuario:
                req.user.id_usuario

        };


        const recibido =
            await service.receiveSAIU(
                data
            );


        return res.status(200).json({

            mensaje:
                'Trámite administrativo recibido correctamente',

            data:
                recibido

        });

    } catch (error) {

        console.error(
            'Error confirmando recepción del SAIU:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// CORREGIR NÚMERO DE EXPEDIENTE
// =====================================

const updateExpediente = async (
    req,
    res
) => {

    try {

        // =====================================
        // VALIDAR DATOS RECIBIDOS
        // =====================================

        const data =
            validator.validateUpdateExpediente({

                ...req.body

            });


        // =====================================
        // USUARIO AUTENTICADO
        // =====================================

        data.id_usuario =
            req.user.id_usuario;


        // =====================================
        // CORREGIR EXPEDIENTE
        // =====================================

        const actualizado =
            await service.updateExpediente(
                data
            );


        // =====================================
        // RESPUESTA
        // =====================================

        return res.status(200).json({

            mensaje:
                'Número de expediente corregido correctamente',

            data:
                actualizado

        });

    } catch (error) {

        console.error(
            'Error corrigiendo expediente:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

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